import type { DemoTicket } from "@/types";

export const demoTickets: DemoTicket[] = [
  {
    id: "ticket-1",
    subject: "REFUND REQUEST - Order #48291",
    customer: "Jamie Chen",
    product: "Pro-Treadmill X500",
    purchaseDate: "12/22/2025",
    message:
      "I've been using this treadmill for about 6 weeks and the motor just completely stopped working mid-run. I almost fell off. This is a $2,000 machine and I expect better. I want a full refund.",
  },
  {
    id: "ticket-2",
    subject: "Return Request - Order #51847",
    customer: "Alex Rivera",
    product: "SoundPro Wireless Earbuds",
    purchaseDate: "01/28/2026",
    message:
      "These earbuds don't fit my ears well. I've tried all the tip sizes but they keep falling out during my runs. I'd like to return them for a refund.",
  },
  {
    id: "ticket-3",
    subject: "DAMAGED SHIPMENT - Order #49103",
    customer: "Morgan Taylor",
    product: "Alpine Pro Hiking Boots",
    purchaseDate: "12/28/2025",
    message:
      "My package arrived completely crushed and the boots inside are scuffed and the sole is partially detached. I contacted the carrier the same day. This was over a month ago and I've been going back and forth with your team. I want this resolved.",
  },
  {
    id: "ticket-4",
    subject: "Return - Order #52201",
    customer: "Sam Park",
    product: "TrailBlazer Daypack",
    purchaseDate: "01/27/2026",
    message:
      "This backpack is smaller than I expected from the photos. Never used it, still has tags. Can I return it?",
  },
];
