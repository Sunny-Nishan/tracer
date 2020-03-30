package com.efight;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseSettings;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.ParcelUuid;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.altbeacon.beacon.Beacon;
import org.altbeacon.beacon.BeaconParser;
import org.altbeacon.beacon.BeaconTransmitter;

import java.util.UUID;

public class BeaconTransmitterService extends Service {
    public static final String CHANNEL_ID = "BeaconTransmitterServiceChannel";

    @Override
    public void onCreate() {
        super.onCreate();
    }

    private BeaconTransmitter beaconTransmitter;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String uuid = intent.getStringExtra("uuid");
        createNotificationChannel();
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, 0);
        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this, CHANNEL_ID);
        Notification notification = mBuilder
                .setContentTitle("Broadcasting signal")
                .setContentText("Broadcasting will run in background")
                .setSmallIcon(R.drawable.notification)
                .setContentIntent(pendingIntent)
                .build();
        startForeground(1, notification);

        // Transmitter

        BeaconParser beaconParser = new BeaconParser()
                .setBeaconLayout("m:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24");

        this.beaconTransmitter = new BeaconTransmitter(this, beaconParser);

        if (this.beaconTransmitter.isStarted()) {
            this.beaconTransmitter.stopAdvertising();
        }

        try {
            Log.i("BLE ", uuid);
            ParcelUuid pUuid = new ParcelUuid(UUID.fromString(uuid));
            int result = BeaconTransmitter.checkTransmissionSupported(getApplicationContext());
            if (result == BeaconTransmitter.SUPPORTED) {
                Log.d("BLE", "Beacon Transmission supported");

                Beacon beacon = new Beacon.Builder()
                        .setManufacturer(0x4C00)
                        .setId1(uuid)
                        .setId2(uuid)
                        .setServiceUuid(1)
                        .setId3(uuid)
                        .setTxPower(-59)
                        .build();

                this.beaconTransmitter.setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED);
                this.beaconTransmitter.startAdvertising(beacon, new AdvertiseCallback() {

                    @Override
                    public void onStartFailure(int errorCode) {
                        Log.e("BLE", "Advertisement start failed with code: " + errorCode);
                        String text = "Broadcasting Failed with error code " + errorCode;
                        int duration = Toast.LENGTH_LONG;
                        Toast toast = Toast.makeText(getApplicationContext(), text, duration);
                        toast.show();
                    }

                    @Override
                    public void onStartSuccess(AdvertiseSettings settingsInEffect) {
                        Log.i("BLE", "Advertisement start succeeded.");


                        WritableMap params = Arguments.createMap();


                        params.putString("status", "success");

                        ReactContext currentContext = getReactApplicationContext();
                        currentContext
                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit("onBroadcastSuccess", params);

                    }
                });
            } else {
                String text = "This device doesn't support BLE signal broadcast";
                int duration = Toast.LENGTH_LONG;
                Toast toast = Toast.makeText(getApplicationContext(), text, duration);
                toast.show();
            }

        } catch (Exception e) {
            Log.i("BLE", e.getMessage());
            String text = e.getMessage();
            int duration = Toast.LENGTH_LONG;
            Toast toast = Toast.makeText(getApplicationContext(), text, duration);
            toast.show();
            e.printStackTrace();
        }

        //do heavy work on a background thread
//        stopSelf();
        return START_NOT_STICKY;
    }


    ReactContext getReactApplicationContext() {
        MainApplication application = (MainApplication) this.getApplication();

        ReactNativeHost reactNativeHost = application.getReactNativeHost();
        ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();
        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

        return reactContext;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        this.beaconTransmitter.stopAdvertising();
        String text = "Stopping broadcast";
        int duration = Toast.LENGTH_SHORT;
        Toast toast = Toast.makeText(getApplicationContext(), text, duration);
        toast.show();

        this.beaconTransmitter = null;
        stopSelf();


        super.onTaskRemoved(rootIntent);
    }

    @Override
    public void onDestroy() {
        if (this.beaconTransmitter != null) {
            this.beaconTransmitter.stopAdvertising();
            String text = "Stopping Broadcast";
            int duration = Toast.LENGTH_SHORT;
            Toast toast = Toast.makeText(getApplicationContext(), text, duration);
            toast.show();

            this.beaconTransmitter = null;
        }


        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Foreground Service Channel",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }
}
