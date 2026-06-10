import User from './User.js';
import Event from './Event.js';
import Registration from './Registration.js';
import QRCode from './QRCode.js';
import CheckIn from './CheckIn.js';
import Comment from './Comment.js';

User.hasMany(Event, { foreignKey: 'organizerId', as: 'organizedEvents' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

User.hasMany(User, { foreignKey: 'createdById', as: 'createdStaff' });
User.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

User.hasMany(Registration, { foreignKey: 'attendeeId', as: 'registrations' });
Registration.belongsTo(User, { foreignKey: 'attendeeId', as: 'attendee' });

Event.hasMany(Registration, { foreignKey: 'eventId', as: 'registrations' });
Registration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

Registration.hasOne(QRCode, { foreignKey: 'registrationId', as: 'qrCode' });
QRCode.belongsTo(Registration, { foreignKey: 'registrationId', as: 'registration' });

QRCode.hasOne(CheckIn, { foreignKey: 'qrCodeId', as: 'checkIn' });
CheckIn.belongsTo(QRCode, { foreignKey: 'qrCodeId', as: 'qrCode' });

User.hasMany(CheckIn, { foreignKey: 'scannedById', as: 'checkIns' });
CheckIn.belongsTo(User, { foreignKey: 'scannedById', as: 'scannedBy' });

Event.hasMany(CheckIn, { foreignKey: 'eventId', as: 'checkIns' });
CheckIn.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

Event.hasMany(Comment, { as: 'comments', foreignKey: 'eventId' });
Comment.belongsTo(Event, { as: 'event', foreignKey: 'eventId' });

User.hasMany(Comment, { as: 'comments', foreignKey: 'userId' });
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });

export { User, Event, Registration, QRCode, CheckIn, Comment };
