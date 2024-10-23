const createTask = async (req, res) => {
    res.status(200).json({
        success: true,
        message: "task create route",
    })
}

module.exports = {createTask};