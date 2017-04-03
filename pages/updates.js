import React from 'react'
import withData from '../lib/withData'
import Frame from '../components/Frame'

import {
  H1, P, Container
} from '@project-r/styleguide'

export default withData((props) => (
  <Frame>
    <Container>
      <H1>Updates</H1>
      <P>
        Aktuelles zum Crowdfunding
      </P>
    </Container>
  </Frame>
))