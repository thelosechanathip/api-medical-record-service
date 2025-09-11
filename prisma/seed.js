// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const pm = new PrismaClient()

async function main() {
    await pm.$connect()

    // 💥table hcodes
    await pm.hcodes.createMany({
        data: [
            { hcode: 11098, hcode_name: 'โรงพยาบาลอากาศอำนวย' },
        ],
        skipDuplicates: true, // rerun ได้ไม่ล้ม
    })
    console.log('✅ Hcodes completed')

    // 💥table patient_services
    await pm.patient_services.createMany({
        data: [
            { patient_service_name_english: 'OPD', patient_service_name_thai: 'ผู้ป่วยนอก' },
            { patient_service_name_english: 'IPD', patient_service_name_thai: 'ผู้ป่วยใน' },
            { patient_service_name_english: 'ER', patient_service_name_thai: 'ผู้ป่วยฉุกเฉิน' },
            { patient_service_name_english: 'LR', patient_service_name_thai: 'ห้องคลอด' },
        ],
        skipDuplicates: true, // rerun ได้ไม่ล้ม
    })
    console.log('✅ Patient services completed')
}

main()
    .then(() => pm.$disconnect())
    .catch((e) => {
        console.error('❌ Seed error:', e)
        pm.$disconnect().finally(() => process.exit(1))
    })
