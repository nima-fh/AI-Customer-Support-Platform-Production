const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}

function getAuthHeaders() {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const error = await response.json().catch(() => null);
  return error?.detail || fallback;
}

export type Conversation = {
  id: number;
  customer_id: number;
  status: string;
  assigned_agent_id: number | null;
};

export type Order = {
  id: number;
  customer_id: number;
  status: string;
  total_price: number;
};
export type Message = {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
};
export type CustomerDetail = Customer & {
  orders: {
    id: number;
    status: string;
    total_price: number;
  }[];

  tickets: {
    id: number;
    subject: string;
    message: string;
    status: string;
    priority: string;
    category: string;
    escalation_required: boolean;
  }[];

  conversations: {
    id: number;
    status: string;
    messages: {
      id: number;
      role: string;
      content: string;
    }[];
  }[];
};
export type Me = {
  user_id: number;
  email: string;
  customer_id: number;
  name: string;
  role: string;
};

export type Ticket = {
  id: number;
  customer_id: number;
  subject: string;
  message: string;
  status: "open" | "pending" | "closed";
  priority: "low" | "normal" | "high";
  category: string;
  escalation_required: boolean;
};

export type TicketCreate = {
  subject: string;
  message: string;
  priority?: "low" | "normal" | "high";
  category?: string;
};

export async function sendChatMessage(
  message: string,
  conversationId?: number,
) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to send message"));
  }

  return response.json();
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_URL}/conversations/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load conversations"),
    );
  }

  return response.json();
}

export async function getConversationMessages(
  conversationId: number,
): Promise<Message[]> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/messages`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to load messages"));
  }

  return response.json();
}

export async function updateTicketAsAgent(
  ticketId: number,
  updates: {
    status?: string;
    priority?: string;
    category?: string;
  },
) {
  const response = await fetch(`${API_URL}/tickets/agent/${ticketId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to update ticket"));
  }

  return response.json();
}

export async function sendAgentMessage(
  ticketId: number,
  content: string,
): Promise<Message> {
  const response = await fetch(
    `${API_URL}/tickets/agent/${ticketId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ content }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to send agent message"),
    );
  }

  return response.json();
}

export async function getTicketConversation(
  ticketId: number,
): Promise<Message[]> {
  const response = await fetch(`${API_URL}/tickets/${ticketId}/conversation`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load ticket conversation"),
    );
  }

  return response.json();
}

export async function takeOverTicket(ticketId: number) {
  const response = await fetch(`${API_URL}/tickets/${ticketId}/take-over`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to take over ticket"),
    );
  }

  return response.json();
}

export async function getConversation(
  conversationId: number,
): Promise<Conversation> {
  const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load conversation"),
    );
  }

  return response.json();
}

export async function deleteConversation(
  conversationId: number,
): Promise<void> {
  const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to delete conversation"),
    );
  }
}

export async function getCustomer(customerId: number): Promise<CustomerDetail> {
  const response = await fetch(`${API_URL}/customers/${customerId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to load customer"));
  }

  return response.json();
}
export async function getMe(): Promise<Me> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to load user"));
  }

  return response.json();
}

export async function getOrders(): Promise<Order[]> {
  const response = await fetch(`${API_URL}/orders/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to load orders"));
  }

  return response.json();
}

export async function getOrder(orderId: number): Promise<Order> {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to load order"));
  }

  return response.json();
}

export async function getTickets(): Promise<Ticket[]> {
  const response = await fetch(`${API_URL}/tickets/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to load tickets"));
  }

  return response.json();
}

export async function getTicket(ticketId: number): Promise<Ticket> {
  const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to load ticket"));
  }

  return response.json();
}

export async function createTicket(ticketData: TicketCreate): Promise<Ticket> {
  const response = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to create ticket"));
  }

  return response.json();
}

export async function updateTicket(
  ticketId: number,
  ticketData: {
    status?: Ticket["status"];
    priority?: Ticket["priority"];
  },
): Promise<Ticket> {
  const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to update ticket"));
  }

  return response.json();
}

export async function deleteTicket(ticketId: number): Promise<void> {
  const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to delete ticket"));
  }
}

export async function getEscalatedTickets(): Promise<Ticket[]> {
  const response = await fetch(`${API_URL}/tickets/escalated`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load escalated tickets"),
    );
  }

  return response.json();
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await fetch(`${API_URL}/customers`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to load customers"),
    );
  }

  return response.json();
}
