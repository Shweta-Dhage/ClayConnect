function allowRoles(...roles) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Unauthorized ❌" });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Access denied ❌" });
            }

            next();

        } catch (error) {
            return res.status(500).json({ message: "Role check error ❌" });
        }
    };
}

module.exports = allowRoles;