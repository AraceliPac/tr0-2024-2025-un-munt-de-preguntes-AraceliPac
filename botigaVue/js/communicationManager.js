
export async function getProductes() {
    const response = await fetch('https://fakestoreapi.com/products');
    const productes = await response.json();
    return productes;
}