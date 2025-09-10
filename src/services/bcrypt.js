const bcrypt = require('bcryptjs')

exports.ComparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash)
}