/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import { setBackgroundMessageHandler } from './src/lib/notifications';

// Handle background messages
setBackgroundMessageHandler();

AppRegistry.registerComponent(appName, () => App);
