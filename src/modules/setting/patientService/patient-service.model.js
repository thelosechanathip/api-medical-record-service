const pm = require('../../../libs/prisma')

// Record work data(บันทึกข้อมูลการทำงาน)
exports.insertLog = async (data) => {
    return pm.patient_service_logs.create({ data: data })
}

// Retrieve all data from the patient_services table(ดึงข้อมูลทั้งหมดจากตาราง patient_services)
exports.fetchAllPatientServices = () => {
    return pm.patient_services.findMany()
}

// Search for infomation by ID in the patient_services table(ค้นหาข้อมูลด้วย ID ในตาราง patient_services)
exports.findFirstPatientService = (key, value) => {
    return pm.patient_services.findFirst({ where: { [key]: value } })
}

// Save data to the patient_services table(บันทึกข้อมูลลงตาราง patient_services)
exports.createPatientService = (data) => {
    return pm.patient_services.create({ data: data })
}