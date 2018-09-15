type ImageDimensions = {
  height: number,
  width: number,
}

type CameraNodeImage = {
  filename: string,
  height: number,
  isStored: boolean,
  playableDuration: number,
  width: number,
  uri: string,
}

type CameraImageNode = {
  group_name: string,
  image: CameraNodeImage,
  location: {[string]: any},
  timestamp: string,
  type: string,
}

type CameraImage = {
  node: CameraImageNode,
}

export type { CameraImage, ImageDimensions }
