import * as mediaController from "./media.controller.js";
import {
	signAccountInLocal,
	updateAccount,
	updateAccountPassword,
	resetAccountPassword,
	signAccountInWithThirdParty,
	signAccountInWithThirdPartyVerifier,
	signAccountInWithThirdPartyValidateAs,
	signAccountInOTP,
	refreshAccessToken,
} from "./account.controller.js";

export { mediaController };
export { signAccountInLocal };
export { refreshAccessToken };
export { updateAccount };
export { updateAccountPassword };
export { resetAccountPassword };
export { signAccountInWithThirdParty };
export { signAccountInWithThirdPartyVerifier };
export { signAccountInWithThirdPartyValidateAs };
export { signAccountInOTP };
