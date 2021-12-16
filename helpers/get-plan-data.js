import config from '../config'

const { plans } = config

export default function getPlanData (planId) {
	if(planId in plans){
		return {
			...plans[planId],
			planId,
		}
	}
	return plans[config.defaultPlan]
}