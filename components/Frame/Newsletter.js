import React, {Component} from 'react'
import {css} from 'glamor'
import {validate as isEmail} from 'email-validator'
import fetch from 'unfetch'

import {
  Button, Field, mediaQueries, fontFamilies
} from '@project-r/styleguide'

const pRule = css({
  fontFamily: fontFamilies.sansSerifRegular,
  fontSize: 18
})

export const P = ({children, ...props}) => (
  <p {...props} {...pRule}>{children}</p>
)

const styles = {
  form: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexFlow: 'row wrap',
    margin: '0 auto'
  }),
  input: css({
    width: '100%',
    marginBottom: 15,
    [mediaQueries.mUp]: {
      marginRight: 10,
      marginBottom: 0,
      width: '58%'
    }
  }),
  button: css({
    width: '100%',
    [mediaQueries.mUp]: {
      width: '38%',
      minWidth: 160
    }
  })
}

class Newsletter extends Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      dirty: false,
      message: null
    }
  }
  onSubmit (event) {
    event.preventDefault()

    const {email, error} = this.state
    if (error) {
      this.setState({dirty: true})
      return
    }
    fetch(`/newsletter/subscribe?email=${encodeURIComponent(email)}`, {credentials: 'same-origin'})
      .then(response => response.json())
      .then(data => {
        this.setState({message: data.message})
        if (data.success) {
          this.handleEmail('')
        }
      })
      .catch(e => {
        this.setState({message:
          'Unerwarteter Fehler, bitte versuchen Sie es später nochmals.'
        })
      })
  }
  handleEmail (value, shouldValidate) {
    this.setState({
      email: value,
      dirty: shouldValidate,
      error: (
        (value.trim().length <= 0 && 'E-Mail fehlt') ||
        (!isEmail(value) && 'E-Mail ungültig')
      )
    })
  }
  componentDidMount () {
    this.handleEmail('')
  }
  render () {
    const {title, maxWidth, black, white, submitText} = this.props
    const {message, email, dirty, error} = this.state

    return (
      <div>
        {!!title && <P>{title}</P>}
        <form {...styles.form} style={{maxWidth}} onSubmit={e => this.onSubmit(e)}>
          <div {...styles.input}>
            <Field
              black={black}
              white={white}
              label='Ihre E-Mail'
              name='EMAIL'
              type='email'
              value={email}
              onChange={(_, value, shouldValidate) => {
                this.handleEmail(value, shouldValidate)
              }}
              error={dirty && error}
            />
          </div>
          <div {...styles.button}>
            <Button block
              black={black}
              white={white}>
              {submitText || 'Registrieren'}
            </Button>
          </div>
        </form>
        {!!message && <P>{message}</P>}
      </div>
    )
  }
}

export default Newsletter
