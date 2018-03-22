/* eslint-disable */
import request from 'request-promise-native';

export const proxyTR = (req, res) => {
	// const data = req.body;
	// const requestData = {
	// 	uri: url,
	// 	body: JSON.stringify(data),
	// 	method: 'POST',
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	}
	// };
	const path = req.url.split('"').join('');
	res.send({status: 'ok', message: req.url.split('"').join('')})
};