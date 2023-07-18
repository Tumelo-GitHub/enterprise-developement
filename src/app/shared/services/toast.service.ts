import { Injectable } from '@angular/core';
import {
  ConfirmBoxInitializer,
  ToastNotificationInitializer,
  DialogLayoutDisplay,
  DisappearanceAnimation,
  AppearanceAnimation,
  ToastPositionEnum,
  ToastProgressBarEnum,
  ToastUserViewTypeEnum,
} from '@costlydeveloper/ngx-awesome-popup';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor() { }

  /**
   * Function to render toast messages
   * @param title - title of the toast
   * @param message - message of the toast
   * @param toastType - SUCCESS | INFO | NONE | DANGER | WARNING
   */
  toastNotification(type: string, title: string, message: string) {
    const newToastNotification = new ToastNotificationInitializer();
    let layoutType = DialogLayoutDisplay.SUCCESS;

    newToastNotification.setTitle(title);
    newToastNotification.setMessage(message);

    switch (type) {
      case 'success':
        layoutType = DialogLayoutDisplay.SUCCESS
        break;
      case 'info':
        layoutType = DialogLayoutDisplay.INFO
        break;
      case 'none':
        layoutType = DialogLayoutDisplay.NONE
        break;
      case 'danger':
        layoutType = DialogLayoutDisplay.DANGER
        break;
      case 'warning':
        layoutType = DialogLayoutDisplay.WARNING
        break;
    }

    // Choose layout color type
    newToastNotification.setConfig({
      autoCloseDelay: 5000, // optional
      textPosition: 'left', // optional
      layoutType: layoutType, // SUCCESS | INFO | NONE | DANGER | WARNING
      progressBar: ToastProgressBarEnum.INCREASE, // INCREASE | DECREASE | NONE
      toastUserViewType: ToastUserViewTypeEnum.SIMPLE, // STANDARD | SIMPLE
      animationIn: AppearanceAnimation.BOUNCE_IN, // BOUNCE_IN | SWING | ZOOM_IN | ZOOM_IN_ROTATE | ELASTIC | JELLO | FADE_IN | SLIDE_IN_UP | SLIDE_IN_DOWN | SLIDE_IN_LEFT | SLIDE_IN_RIGHT | NONE
      animationOut: DisappearanceAnimation.BOUNCE_OUT, // BOUNCE_OUT | ZOOM_OUT | ZOOM_OUT_WIND | ZOOM_OUT_ROTATE | FLIP_OUT | SLIDE_OUT_UP | SLIDE_OUT_DOWN | SLIDE_OUT_LEFT | SLIDE_OUT_RIGHT | NONE
      // TOP_LEFT | TOP_CENTER | TOP_RIGHT | TOP_FULL_WIDTH | BOTTOM_LEFT | BOTTOM_CENTER | BOTTOM_RIGHT | BOTTOM_FULL_WIDTH
      toastPosition: ToastPositionEnum.TOP_RIGHT,
    });

    

    // Simply open the popup
    newToastNotification.openToastNotification$();
  }

  /**
   * Function to display confirm box
   * @param type - confirm box type SUCCESS | INFO | NONE | DANGER | WARNING
   * @param title - confirm boz title
   * @param message - confirm box message
   */
  openConfirmBox(type: string, title: string, message: string, ) {
    const newConfirmBox = new ConfirmBoxInitializer();
    let layoutType = DialogLayoutDisplay.SUCCESS;

    newConfirmBox.setTitle(title);
    newConfirmBox.setMessage(message);

    switch (type) {
      case 'success':
        layoutType = DialogLayoutDisplay.SUCCESS
        break;
      case 'info':
        layoutType = DialogLayoutDisplay.INFO
        break;
      case 'none':
        layoutType = DialogLayoutDisplay.NONE
        break;
      case 'danger':
        layoutType = DialogLayoutDisplay.DANGER
        break;
      case 'warning':
        layoutType = DialogLayoutDisplay.WARNING
        break;
    }

    // Choose layout color type
    newConfirmBox.setConfig({
      layoutType: layoutType, // SUCCESS | INFO | NONE | DANGER | WARNING
      animationIn: AppearanceAnimation.BOUNCE_IN, // BOUNCE_IN | SWING | ZOOM_IN | ZOOM_IN_ROTATE | ELASTIC | JELLO | FADE_IN | SLIDE_IN_UP | SLIDE_IN_DOWN | SLIDE_IN_LEFT | SLIDE_IN_RIGHT | NONE
      animationOut: DisappearanceAnimation.BOUNCE_OUT, // BOUNCE_OUT | ZOOM_OUT | ZOOM_OUT_WIND | ZOOM_OUT_ROTATE | FLIP_OUT | SLIDE_OUT_UP | SLIDE_OUT_DOWN | SLIDE_OUT_LEFT | SLIDE_OUT_RIGHT | NONE
    });

    // Simply open the popup
     return newConfirmBox.openConfirmBox$();
  }
}
