type CameraImage = {
  node: CameraImageNode,
}

type CameraImageNode = {
  group_name: string,
  image: CameraNodeImage,
  location: { [string]: any },
  timestamp: string,
  type: string,
}

type CameraNodeImage = {
  filename: string,
  height: number,
  isStored: boolean,
  playableDuration: number,
  width: number,
  uri: string,
}

export default { CameraImage }
