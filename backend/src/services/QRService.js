import QRCodeLib from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { QRCode } from '../models/index.js';

class QRService {
  async generateForRegistration(registrationId) {
    const token = uuidv4();
    const qrImageUrl = await QRCodeLib.toDataURL(token, { errorCorrectionLevel: 'H', margin: 2, width: 300 });
    return await QRCode.create({ registrationId, token, qrImageUrl });
  }
}
export default QRService;
