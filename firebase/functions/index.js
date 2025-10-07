const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.onRideRequest = functions.firestore
  .document('ride_requests/{requestId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    // TODO: Lookup driver token and send FCM
    console.log('Ride request created', data);
  });

exports.onRideAcceptance = functions.firestore
  .document('ride_requests/{requestId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    if (after.status === 'accepted') {
      // TODO: Notify rider via FCM
      console.log('Ride accepted', after);
    }
  });

exports.onRideLifecycleChange = functions.firestore
  .document('rides/{rideId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    // status: started|ended|cancelled
    if (['started', 'ended', 'cancelled'].includes(after.status)) {
      // TODO: Broadcast notification to ride members
      console.log('Ride lifecycle change', after.status);
    }
  });
