// Funciton Set ข้อมูล Log การทำงานของระบบก่อนที่จะบันทึกไปยัง Database
exports.setLog = (req, fullname, endTime, resultData) => {
    // Declare variables(ประกาศตัวแปร)
    let row_count
    let status

    // Assign a value to a variable(กำหนดค่าให้กับตัวแปร)
    if (req.method === 'GET') {
        row_count = resultData.length
        status = resultData.length > 0 ? 'Success' : 'No Data'
    } else {
        row_count = resultData ? 1 : 0
        status = resultData ? 'Success' : 'Failed'
    }

    // Assign a value to the data object(กำหนดค่าให้กับ data ในรูปแบบของอ็อบเจกต์)
    const data = {
        ip_address: req.headers['x-forwarded-for'] || req.ip,
        name: fullname,
        request_method: req.method,
        endpoint: req.originalUrl,
        execution_time: endTime,
        row_count: row_count,
        status: status
    }

    // Return log data(ส่งคืนขค่ากลับไป)
    return data
}