import logging
from app.config import get_settings

logger = logging.getLogger(__name__)


def normalize_phone(phone: str) -> str:
    """Normalize phone number to E.164 format (defaults to India +91 if 10 digits)."""
    cleaned = "".join(ch for ch in phone if ch.isdigit() or ch == "+")
    if not cleaned:
        return ""
    if not cleaned.startswith("+"):
        if len(cleaned) == 10:
            cleaned = "+91" + cleaned
        else:
            cleaned = "+" + cleaned
    return cleaned


def build_alert_message(
    traveller_name: str,
    kind: str,
    share_token: str,
    location: dict | None = None,
    custom_reason: str | None = None,
) -> str:
    settings = get_settings()
    track_url = f"{settings.public_track_base_url.rstrip('/')}/{share_token}"

    maps_part = ""
    if location and isinstance(location, dict):
        lat = location.get("lat")
        lng = location.get("lng")
        if lat is not None and lng is not None:
            maps_part = f" Map: https://maps.google.com/?q={lat},{lng}"

    upper_kind = (kind or "").upper()
    if upper_kind in {"SOS", "PANIC", "DURESS", "POLICE_ALERT"}:
        reason_txt = f" Reason: {custom_reason}." if custom_reason else ""
        return (
            f"🚨 EMERGENCY ALERT: {traveller_name} triggered an SOS on SheMove!{reason_txt} "
            f"Live Tracking: {track_url}{maps_part}"
        )
    elif upper_kind in {"MISSED_CHECKIN", "CHECKIN_OVERDUE", "DEVIATION"}:
        return (
            f"⚠️ SheMove Warning: {traveller_name} missed a safety check-in! "
            f"Track live journey: {track_url}{maps_part}"
        )
    elif upper_kind == "JOURNEY_STARTED":
        return (
            f"🛡️ SheMove: {traveller_name} started a protected journey. "
            f"You are listed as a trusted contact. Track live: {track_url}"
        )
    elif upper_kind in {"SAFE_ARRIVAL", "JOURNEY_COMPLETED"}:
        return (
            f"✅ SheMove: {traveller_name} has safely reached their destination. "
            f"Tracking session closed."
        )
    else:
        desc = custom_reason or f"Status: {kind}"
        return f"SheMove Alert for {traveller_name}: {desc}. Track: {track_url}"


def send_sms(to_phone: str, body: str) -> bool:
    """Send SMS via Twilio. Returns True on success or logged mock, False on failure."""
    settings = get_settings()

    if not settings.twilio_enabled or not settings.twilio_account_sid or not settings.twilio_auth_token:
        logger.info(f"[Twilio DISABLED] SMS to {to_phone}: {body}")
        return True

    if not settings.twilio_from_number:
        logger.warning(
            f"[Twilio CONFIG NOTICE] TWILIO_FROM_NUMBER is not set in .env. "
            f"Cannot send real SMS to {to_phone}. Message would have been: {body}"
        )
        return False

    try:
        from twilio.rest import Client

        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        formatted_to = normalize_phone(to_phone)
        if not formatted_to:
            logger.warning(f"Invalid phone number '{to_phone}', skipping SMS.")
            return False

        formatted_from = normalize_phone(settings.twilio_from_number)
        try:
            message = client.messages.create(
                body=body,
                from_=formatted_from,
                to=formatted_to,
            )
            logger.info(f"✅ Twilio SMS sent to {formatted_to} (SID: {message.sid})")
            return True
        except Exception as inner_exc:
            err_str = str(inner_exc)
            if "572006" in err_str or "predefined SMS templates" in err_str or "Invalid template name" in err_str:
                logger.warning(
                    f"⚠️ [Twilio Trial Account] Custom SMS body restricted by Twilio trial policy. "
                    f"Retrying with approved trial alert template 'sms_account_alerts' to {formatted_to}..."
                )
                message = client.messages.create(
                    body="sms_account_alerts",
                    from_=formatted_from,
                    to=formatted_to,
                )
                logger.info(f"✅ Twilio Trial SMS sent to {formatted_to} via template (SID: {message.sid})")
                return True
            raise inner_exc
    except Exception as exc:
        err_str = str(exc)
        if "572002" in err_str or "verified recipient" in err_str:
            logger.warning(
                f"⚠️ [Twilio Trial] {to_phone} must be added to Verified Caller IDs before Twilio can deliver SMS to it: "
                f"https://console.twilio.com/us1/develop/phone-numbers/manage/verified"
            )
        else:
            logger.error(f"❌ Failed to send Twilio SMS to {to_phone}: {exc}")
        return False


def send_whatsapp(to_phone: str, body: str) -> bool:
    """Send WhatsApp message via Twilio WhatsApp API / Sandbox."""
    settings = get_settings()

    if not settings.twilio_enabled or not settings.twilio_whatsapp_enabled:
        logger.info(f"[Twilio WhatsApp DISABLED] Message to {to_phone}: {body}")
        return True

    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        logger.info(f"[Twilio MOCK] WhatsApp to {to_phone}: {body}")
        return True

    from_number = settings.twilio_whatsapp_from_number or settings.twilio_from_number or "+14155238886"
    try:
        import json
        from twilio.rest import Client

        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        formatted_to = normalize_phone(to_phone)
        if not formatted_to:
            logger.warning(f"Invalid phone number '{to_phone}', skipping WhatsApp.")
            return False

        formatted_from = normalize_phone(from_number)
        # Twilio WhatsApp requires 'whatsapp:' prefix for both sender and recipient
        if settings.twilio_whatsapp_content_sid:
            message = client.messages.create(
                from_=f"whatsapp:{formatted_from}",
                to=f"whatsapp:{formatted_to}",
                content_sid=settings.twilio_whatsapp_content_sid,
                content_variables=json.dumps({"1": "SheMove Alert", "2": body[:80]}),
            )
        else:
            try:
                message = client.messages.create(
                    body=body,
                    from_=f"whatsapp:{formatted_from}",
                    to=f"whatsapp:{formatted_to}",
                )
            except Exception as w_exc:
                if "21654" in str(w_exc) or "ContentSid Required" in str(w_exc):
                    logger.warning(
                        "⚠️ [Twilio WhatsApp Policy] Outbound WhatsApp messages require a registered ContentSid template (Error 21654). "
                        "Please configure TWILIO_WHATSAPP_CONTENT_SID in .env with the template SID from the 'Try out WhatsApp' console page."
                    )
                raise w_exc
        logger.info(f"✅ Twilio WhatsApp sent to {formatted_to} (SID: {message.sid})")
        return True
    except Exception as exc:
        err_str = str(exc)
        if "572002" in err_str or "verified recipient" in err_str:
            logger.warning(
                f"⚠️ [Twilio Trial] {to_phone} must be added to Verified Caller IDs before Twilio can deliver WhatsApp to it: "
                f"https://console.twilio.com/us1/develop/phone-numbers/manage/verified"
            )
        else:
            logger.error(f"❌ Failed to send Twilio WhatsApp to {to_phone}: {exc}")
        return False
