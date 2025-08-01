const app = require("./src/app")
const PORT = process.env.PORT
if (!PORT) return console.error("Please set PORT in .env file")

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))