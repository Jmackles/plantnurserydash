export async function fetchWantListEntries() {
  const response = await fetch('/api/want-list');
  if (!response.ok) throw new Error('Failed to fetch want list entries');
  return response.json();
}

export async function fetchCustomers() {
  const response = await fetch('/api/customers');
  if (!response.ok) throw new Error('Failed to fetch customers');
  return response.json();
}

export async function addCustomer(customer: any) {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer)
  });
  if (!response.ok) throw new Error('Failed to add customer');
  return response.json();
}

export async function addWantListEntry(data: any) {
  const response = await fetch('/api/want-list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to add want list entry');
  return response.json();
}
