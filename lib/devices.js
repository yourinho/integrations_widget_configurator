/**
 * Mobile device viewport widths (CSS pixels) for preview.
 * iPhone from X onwards; top 5 Android by popularity.
 */

(function () {
  'use strict';

  const DEVICES = [
    { label: 'iPhone X / XS / 11 Pro / 12 mini / 13 mini', width: 375, group: 'iphone' },
    { label: 'iPhone XR / 11 / XS Max', width: 414, group: 'iphone' },
    { label: 'iPhone 12 / 13 / 14 / 15 / 16', width: 390, group: 'iphone' },
    { label: 'iPhone 14 / 15 / 16 Pro', width: 393, group: 'iphone' },
    { label: 'iPhone 12 / 13 Pro Max / 14 Plus', width: 428, group: 'iphone' },
    { label: 'iPhone 14 / 15 / 16 Pro Max / 15 Plus', width: 430, group: 'iphone' },
    { label: 'iPhone 17 / 17 Pro', width: 402, group: 'iphone' },
    { label: 'iPhone 17 Plus', width: 420, group: 'iphone' },
    { label: 'iPhone 17 Pro Max', width: 440, group: 'iphone' },
    { label: 'Samsung Galaxy S24 / S23', width: 360, group: 'android' },
    { label: 'Samsung Galaxy A54', width: 412, group: 'android' },
    { label: 'Google Pixel 8', width: 412, group: 'android' },
    { label: 'Samsung Galaxy A55', width: 412, group: 'android' },
    { label: 'OnePlus 12', width: 412, group: 'android' },
  ];

  window.Devices = { list: DEVICES };
})();
