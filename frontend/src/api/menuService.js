export const getMenu = async () => {
  const res = await fetch(`${BASE_URL}/menu`);
  return await res.json();
};