const { msg } = require('../../services/message.service')
const dbM = require('./dashboard.model')

exports.FetchMraIpdCount = async (_, res) => {
    try {
        const CA = await dbM.CountAll()
        if (!CA) return msg(res, 404, { message: 'Data not found!' })

        const CFiBW = await dbM.CountFormIpdByWard()
        if (!CFiBW) return msg(res, 404, { message: 'Data not found!' })

        const CDtFiBS = await dbM.CountDistinctFormIpdByService()
        if (!CDtFiBS) return msg(res, 404, { message: 'Data not found!' })

        return msg(res, 200, {
            countAll: CA,
            countWard: CFiBW,
            countPatientService: CDtFiBS
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