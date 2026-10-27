"""Stripe Checkout · SDK officiel Stripe (remplace emergentintegrations, indisponible hors Emergent).

Même interface que l'ancien module : StripeCheckout(api_key, webhook_url) avec
create_checkout_session, get_checkout_status et handle_webhook.
Les montants sont reçus en euros et envoyés à Stripe en centimes.
"""
import asyncio
import os
from typing import Dict, Optional

import stripe
from fastapi import HTTPException
from pydantic import BaseModel

STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")


class CheckoutSessionRequest(BaseModel):
    amount: float
    currency: str
    success_url: str
    cancel_url: str
    metadata: Optional[Dict[str, str]] = None


class CheckoutSessionResponse(BaseModel):
    url: str
    session_id: str


class CheckoutStatusResponse(BaseModel):
    status: str
    payment_status: str
    amount_total: int
    currency: str
    metadata: Dict[str, str] = {}


class WebhookEvent(BaseModel):
    event_type: str
    session_id: str = ""
    payment_status: str = ""


class StripeCheckout:
    def __init__(self, api_key: str, webhook_url: str = ""):
        if not api_key:
            raise HTTPException(status_code=503, detail="Le paiement en ligne n'est pas encore activé")
        self.api_key = api_key

    async def create_checkout_session(self, req: CheckoutSessionRequest) -> CheckoutSessionResponse:
        session = await asyncio.to_thread(
            stripe.checkout.Session.create,
            api_key=self.api_key,
            mode="payment",
            line_items=[{
                "quantity": 1,
                "price_data": {
                    "currency": req.currency,
                    "unit_amount": int(round(req.amount * 100)),
                    "product_data": {"name": (req.metadata or {}).get("package_label") or "Cook & Food Gala"},
                },
            }],
            customer_email=(req.metadata or {}).get("email") or None,
            success_url=req.success_url,
            cancel_url=req.cancel_url,
            metadata=req.metadata or {},
        )
        return CheckoutSessionResponse(url=session.url, session_id=session.id)

    async def get_checkout_status(self, session_id: str) -> CheckoutStatusResponse:
        s = await asyncio.to_thread(stripe.checkout.Session.retrieve, session_id, api_key=self.api_key)
        return CheckoutStatusResponse(
            status=s.status or "", payment_status=s.payment_status or "",
            amount_total=s.amount_total or 0, currency=s.currency or "",
            metadata=dict(s.metadata or {}),
        )

    async def handle_webhook(self, body: bytes, signature: Optional[str]) -> WebhookEvent:
        if not STRIPE_WEBHOOK_SECRET:
            raise ValueError("STRIPE_WEBHOOK_SECRET manquant · webhook refusé")
        event = stripe.Webhook.construct_event(body, signature or "", STRIPE_WEBHOOK_SECRET)
        obj = event["data"]["object"]
        if event["type"].startswith("checkout.session."):
            return WebhookEvent(event_type=event["type"], session_id=obj.get("id", ""),
                                payment_status=obj.get("payment_status", ""))
        return WebhookEvent(event_type=event["type"])
