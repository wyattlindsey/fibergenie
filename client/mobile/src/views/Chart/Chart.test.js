// @flow
/* eslint-disable global-require */
import React from 'react'
import renderer from 'react-test-renderer'

import type { ChartData } from 'types/chart'
import type { CameraImage } from 'types/image'

import Chart from './Chart'

it('renders without crashing', () => {
  const { chartData }: ChartData = require('test/fixtures/chart').default
  const {
    cameraImage: image,
  }: CameraImage = require('test/fixtures/image').default

  const data = {
    chartData,
    image,
  }

  const navigation = {
    getParam: jest.fn((key: string): CameraImage | ChartData => data[key]),
    navigate: jest.fn(),
    scrollTo: jest.fn(),
  }

  const rendered = renderer
    .create(
      <Chart chartData={chartData} image={image} navigation={navigation} />
    )
    .toJSON()
  expect(rendered).toBeTruthy()
})
