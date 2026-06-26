function formatProductImage(img) {
    let imgUrl = "http://localhost:5000/uploads/default.png";

    if (!img) return imgUrl;

    if (img.startsWith("http")) {
        return img;
    }

    const normalized = img.replace(/\\/g, "/");

    if (normalized.includes("uploads/")) {
        return `http://localhost:5000/${normalized}`;
    }

    if (
        normalized.includes("images/") ||
        normalized.startsWith("./images")
    ) {
        return `http://localhost:5000/images/${normalized.replace(/^(\.\/)?images\//, "")}`;
    }

    return `http://localhost:5000/uploads/${normalized}`;
}

module.exports = formatProductImage;