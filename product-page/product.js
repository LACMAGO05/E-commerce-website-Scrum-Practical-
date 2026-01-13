const products = [
    {
        name: "Wireless Headphones",
        price: "$99.99",
        category: "Electronics",
        description: "High-quality wireless headphones with noise cancellation.",
        image: "images/wireless.jpg"
    },
    {
        name: "Smart Watch",
        price: "$149.99",
        category: "Wearables",
        description: "Track your fitness and notifications on the go.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
    },
    {
        name: "Tshirts",
        price: "$69.99",
        category: "Footwear",
        description: "Tested and trusted, durables and for all sizes.",
        image: "images/Tshits.webp"
    },
    {
        name: "Ear Port",
        price: "$59.99",
        category: "Accessories",
        description: "Stylish Ear Port perfect for travel and work.",
        image: "images/download1.webp"
    },
    {
        name: "Bag Pack",
        price: "$49.99",
        category: "Bag",
        description: "High-quality Bar suitable for carrying laptop and other accessories",
        image: "images/bagpack.webp"
    },
    {
        name: "Apple Laptop",
        price: "$449.99",
        category: "Wearables",
        description: "Easy working experiences fast and portable",
        image: "images/apple.webp"
    },
    {
        name: "Running Shoes",
        price: "$39.99",
        category: "Footwear",
        description: "Comfortable and durable shoes for everyday running.",
        image: "images/footwear.webp"
    },
    {
        name: "Power Bank",
        price: "$29.99",
        category: "Accessories",
        description: "Saves time, cost and make your travelling secure.",
        image: "images/power_bank.webp"
    },
    {
        name: "Bluetooth",
        price: "$79.99",
        category: "Accessories",
        description: "Entertainment, relaxation suitabke for small gathering ang get together.",
        image: "images/bluetooth.webp"
    }
];

const container = document.getElementById("product-container");

products.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="category">${product.category}</p>
            <p class="price">${product.price}</p>
            <p class="description">${product.description}</p>
        </div>
    `;

    container.appendChild(card);
});
