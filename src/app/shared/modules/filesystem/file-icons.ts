/* eslint-disable @typescript-eslint/naming-convention */
/*
Map for file type to Font Awesome 5 Pro Icon
*/
type Icon = FONT_AWESOME_ICONS;
const IconMap = new Map<string, Icon>();

const enum FILE_TYPE {
  WORD = 'word',
  POWERPOINT = 'powerpoint',
  EXCEL = 'excel',
  PDF = 'pdf',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  CODE = 'code'
}

const enum FONT_AWESOME_ICONS {
  FILE = 'fa-file',
  WORD = 'fa-file-word',
  POWERPOINT = 'fa-file-powerpoint',
  EXCEL = 'fa-file-excel',
  PDF = 'fa-file-pdf',
  IMAGE = 'fa-file-image',
  VIDEO = 'fa-file-video',
  AUDIO = 'fa-file-audio',
  ARCHIVE = 'fa-file-archive',
  CODE = 'fa-file-code'
}

const extensions = {
  '.doc.docx.dotx': 'word',
  '.ppt.pptx': 'powerpoint',
  '.xls.xlsx': 'excel',
  '.pdf': 'pdf',
  '.jpg.jpeg.gif.png.svg.bmp': 'image',
  '.mp4.avi.flv.wmv.mov': 'video',
  '.mp3.wav.pcm.aiff.acc.ogg.wma.flac.alac': 'audio',
  '.zip.rar.tar.gzip.bzip2.lzip.7z.apk.jar.deb.rpm.msi': 'archive',
  '.js.ts.java.jsp.class.cmd.py.pl.pm.c.h.hpp.hdl.html.css.scss.xml.sh': 'code'
};

// Microsoft Office Icons
IconMap.set(FILE_TYPE.WORD, FONT_AWESOME_ICONS.WORD);
IconMap.set(FILE_TYPE.POWERPOINT, FONT_AWESOME_ICONS.POWERPOINT);
IconMap.set(FILE_TYPE.EXCEL, FONT_AWESOME_ICONS.EXCEL);

// General Icons
IconMap.set(FILE_TYPE.PDF, FONT_AWESOME_ICONS.PDF);
IconMap.set(FILE_TYPE.IMAGE, FONT_AWESOME_ICONS.IMAGE);
IconMap.set(FILE_TYPE.VIDEO, FONT_AWESOME_ICONS.VIDEO);
IconMap.set(FILE_TYPE.AUDIO, FONT_AWESOME_ICONS.AUDIO);
IconMap.set(FILE_TYPE.ARCHIVE, FONT_AWESOME_ICONS.ARCHIVE);
IconMap.set(FILE_TYPE.CODE, FONT_AWESOME_ICONS.CODE);

export function getIcon(extension: string): Icon {
  let icon = FONT_AWESOME_ICONS.FILE;
  if (!extension) {
    return icon;
  }
  const fileType = getFileType(extension);
  if (fileType) {
    icon = IconMap.get(fileType);
  }
  return icon;
}

function getFileType(extension: string): FILE_TYPE {
  const matchPattern = new RegExp(extension, 'ig');
  let type = null;
  for (const [key, value] of Object.entries(extensions)) {
    if (matchPattern.test(key)) {
      type = value;
      break;
    }
  }
  return type;
}
