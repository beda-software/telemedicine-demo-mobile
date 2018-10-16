package software.beda.telemedicinedemo;

import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ActivityLauncher extends ReactContextBaseJavaModule {

  public ActivityLauncher(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "ActivityLauncher";
  }

  @ReactMethod
  public void openMainActivity() {
    Log.i(getName(), "Asked to open the Main activity");
    ReactApplicationContext context = getReactApplicationContext();
    Intent intent = new Intent(context, MainActivity.class);
    context.startActivity(intent);
  }
}
