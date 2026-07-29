export default {
  default: {
    files: {
      // Keep uploads in the media library. Turn this off when the attachment
      // only has to reach the notification email, so files that carry personal
      // data are not kept after sending.
      store: true,
      maxFiles: 3,
      maxFileSize: 10 * 1024 * 1024,
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.oasis.opendocument.text',
        'application/rtf',
        'text/rtf',
        'image/jpeg',
        'image/png',
      ],
    },
  },
  validator() {},
};
