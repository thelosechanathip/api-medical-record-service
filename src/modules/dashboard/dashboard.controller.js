const { msg } = require('../../services/message.service')
const dbM = require('./dashboard.model')

exports.FetchMraIpdCount = async (_, res) => {
    try {
        const CA = await dbM.CountAll()

        const CaPctNn = await dbM.CountAllPercentageNotNull()

        const CaPctN = await dbM.CountAllPercentageNull()

        const CFiBW = await dbM.CountFormIpdByWard()

        const CDtFiBS = await dbM.CountDistinctFormIpdByService()

        const APsne = await dbM.AveragePatientServiceNameEnglish()

        const AW = await dbM.AverageWard()

        const AA = await dbM.AverageAll()
       
        if (!CA || !CFiBW || !CDtFiBS || !APsne || !AW || !AA) 
            return msg(res, 404, { message: 'ไม่พบข้อมูล!' })

        return msg(res, 200, {
            countAll: CA,
            countAllPercentageNotNull: CaPctNn,
            countAllPercentageNull: CaPctN,
            countWard: CFiBW,
            countPatientService: CDtFiBS,
            averagePatientServiceNameEnglish: APsne,
            averageWard: AW,
            averageAll: AA
        })
    } catch (err) {
        console.log('FetchMraIpdCount : ', err)
        return msg(res, 500, { message: err.message })
    }
}

exports.FetchAllAn = async (req, res) => {
    try {
        const { ward } = req.params

        const FABW = await dbM.FetchAnByWard(ward)
        if (!FABW) return msg(res, 404, { message: 'Data not found!' })

        const FABWR = await Promise.all(
            FABW.map(async (i) => {
                const FFiBPi = await dbM.FetchFormIpdByPatientId(i.patient_id)
                return { ...i, form_ipd: FFiBPi }
            })
        )

        return msg(res, 200, { data: FABWR })
    } catch (err) {
        console.log('FetchAnByWard : ', err)
        return msg(res, 500, { message: err.message })
    }
}