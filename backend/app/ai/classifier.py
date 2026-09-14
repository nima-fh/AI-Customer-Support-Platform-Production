from pydantic import BaseModel
from enum import Enum

from .llm import llm


class TicketCategory(str, Enum):
    SHIPPING = "shipping"
    REFUND = "refund"
    PAYMENT = "payment"
    PRODUCT = "product"
    ACCOUNT = "account"
    TECHNICAL = "technical"
    OTHER = "other"


class TicketClassification(BaseModel):
    category: TicketCategory
    priority: str
    escalation_required: bool


CLASSIFICATION_PROMPT = """
You are a customer support ticket classifier.

Classify the customer's support request into exactly one category.

Categories:

- shipping
- refund
- payment
- product
- account
- technical
- other

Also determine:

1. priority:
   - low
   - normal
   - high

2. escalation_required:
   - true
   - false

Rules:

SHIPPING:
Questions or problems involving delivery, shipping, tracking,
late packages, missing packages, or packages not received.

REFUND:
Refund requests, returns, cancellations, or questions about
getting money back.

PAYMENT:
Payment failures, duplicate charges, incorrect charges,
billing problems, or payment-related issues.

PRODUCT:
Damaged products, defective products, wrong products,
product questions, or product-related problems.

ACCOUNT:
Problems involving customer accounts, profiles, login,
or account information.

TECHNICAL:
Technical problems with the company's website, application,
or technical services.

OTHER:
Anything that does not clearly belong to another category.

Priority:

HIGH:
Use high priority for serious problems such as:
- lost or missing packages
- duplicate or incorrect charges
- damaged or defective products
- serious account problems
- urgent customer-impacting issues

NORMAL:
Use normal for ordinary support requests.

LOW:
Use low for minor questions or non-urgent requests.

Escalation:

Set escalation_required to true when the issue is serious enough
that a human support agent should review it.

Examples:
- lost package
- damaged product
- duplicate charge
- serious account problem

For ordinary questions, set it to false.

Return ONLY the structured classification.
"""


def classify_ticket(message: str) -> TicketClassification:
    structured_llm = llm.with_structured_output(TicketClassification)

    result = structured_llm.invoke(
        [
            {"role": "system", "content": CLASSIFICATION_PROMPT},
            {"role": "user", "content": message},
        ]
    )

    return result
