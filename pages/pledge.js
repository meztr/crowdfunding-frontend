import React, {Component, PropTypes} from 'react'
import withData from '../lib/withData'
import Router from 'next/router'
import { gql, withApollo, graphql } from 'react-apollo'
import withMe from '../lib/withMe'
import SignIn from '../components/Auth/SignIn'
import SignOut from '../components/Auth/SignOut'

import {
  Button,
  H1, H2, Field, P, A,
  NarrowContainer,
  colors
} from '@project-r/styleguide'

import Frame from '../components/Frame'
import Accordion from '../components/Accordion'
import FieldSet from '../components/FieldSet'

const PAYMENT_METHODS = [
  { disabled: true, key: 'EZS', name: 'Einzahlungsschein' },
  { disabled: false, key: 'VISA', name: 'Visa' },
  { disabled: false, key: 'MASTERCARD', name: 'MasterCard' },
  { disabled: true, key: 'PFC', name: 'PostfFinance Card' }
]

class Pledge extends Component {
  constructor (props) {
    super(props)
    this.state = {
      emailFree: true,
      values: {},
      errors: {},
      dirty: {}
    }
    this.amountRefSetter = (ref) => {
      this.amountRef = ref
    }
  }
  componentDidMount () {
    if (this.amountRef && this.amountRef.input) {
      this.amountRef.input.focus()
    }
  }
  render () {
    const {
      name,
      email,
      emailFree,
      paymentMethod,
      paymentError,
      submitError
    } = this.state
    const {query, client, me} = this.props

    const handleChange = field => {
      return event => {
        const value = event.target.value
        this.setState(() => ({
          [field]: value
        }))
      }
    }
    const handleEmailChange = field => {
      return event => {
        const value = event.target.value
        this.setState({email: value})

        // check if email is untaken or we need to login
        // throttle
        clearTimeout(this.emailTimeout)
        this.emailTimeout = setTimeout(async () => {
          const {data} = await client.query({
            query: gql`
              query checkEmail($email: String!) {
                checkEmail(email: $email) {
                  free
                }
              }
            `,
            variables: { email: value }
          })
          this.setState(
            { emailFree: data.checkEmail.free }
          )
        }, 300)
      }
    }

    const submitPledge = event => {
      const {values} = this.state
      window.Stripe.setPublishableKey('pk_test_sgFutulewhWC8v8csVIXTMea')
      window.Stripe.source.create({
        type: 'card',
        currency: 'CHF',
        usage: 'reusable',
        card: {
          number: values.cardNumber,
          cvc: values.cardCVC,
          exp_month: values.cardMonth,
          exp_year: values.cardYear
        }
      }, (status, source) => {
        console.log('stripe', status, source)
        if (status !== 200) {
          // source.error.type
          // source.error.param
          // source.error.message
          // see https://stripe.com/docs/api#errors
          this.setState({
            paymentError: source.error.message
          })
        } else {
          this.setState({
            paymentError: undefined
          })

          // TODO implement 3D secure
          if (source.card.three_d_secure === 'required') {
            window.alert('Cards requiring 3D secure are not supported yet.')
          } else {
            const total = query.amount
            const pledgeOptions = JSON.parse(query.pledgeOptions)

            // don't provide a user if logged in
            const user = me ? null : {email, name}
            // TODO adapt for other paymentMethods
            const payment = {
              method: paymentMethod,
              stripeSourceId: source.id
            }
            this.props
              .mutate({
                variables: {
                  total,
                  options: pledgeOptions.map(option => ({
                    amount: option.amount,
                    price: option.price,
                    templateId: option.id
                  })),
                  user,
                  payment
                }
              })
              .then(({ data }) => {
                if (data.submitPledge) {
                  Router.push({
                    pathname: '/merci',
                    query: {
                      id: data.submitPledge.id,
                      email: email
                    }
                  })
                } else {
                  this.setState({
                    submitError: 'data.submitPledge fehlt'
                  })
                }
              })
              .catch(error => {
                this.setState({
                  submitError: error.graphQLErrors && error.graphQLErrors.length
                    ? error.graphQLErrors.map(e => e.message).join(', ')
                    : error.toString()
                })
              })
          }
        }
      })
    }

    return (
      <div>
        <H2>Belohnungen</H2>

        {query.package ? (
          <div style={{marginBottom: 40}}>
            <P>
              {query.packageName}
              {' '}
              <A href='/pledge' onClick={event => {
                event.preventDefault()
                Router.replace('/pledge', '/pledge', {shallow: true})
              }}>
                ändern
              </A>
            </P>
            <P>
              {JSON.parse(query.pledgeOptions)
                .filter(option => option.configurable && option.amount)
                .map(option => (
                  <span key={option.id}>
                    {option.amount}
                    {' x '}
                    {option.name}
                    <br />
                  </span>
                ))
              }
            </P>
            <P>
              <Field label='Betrag'
                ref={this.amountRefSetter}
                value={query.amount / 100}
                onChange={event => {
                  const url = {
                    pathname: '/pledge',
                    query: {
                      ...query,
                      amount: event.target.value * 100
                    }
                  }
                  Router.replace(url, url, {shallow: true})
                }} />
            </P>
          </div>
        ) : (
          <Accordion onSelect={params => {
            const url = {
              pathname: '/pledge',
              query: params
            }
            Router.replace(url, url, {shallow: true})
              .then(() => {
                window.scrollTo(0, 0)
                if (this.amountRef && this.amountRef.input) {
                  this.amountRef.input.focus()
                }
              })
          }} />
        )}

        <H2>Deine Kontaktinformationen</H2>
        <div style={{marginTop: 0, marginBottom: 40}}>
          {me ? (
            <span>
              <strong>Du bist eingeloggt als:</strong><br />
              {me.name}<br />
              {me.email}<br /><br />
              <SignOut />
            </span>
          ) : (
            <span>
              <Field label='Dein Name'
                value={name}
                onChange={handleChange('name')} />
              <br />
              <Field label='Deine E-Mail'
                value={email}
                onChange={handleEmailChange()} />
              <br /><br />
            </span>
          )}
        </div>

        {(!emailFree && !me) && (
          <div>
            <p>Es existiert bereits ein Account mit dieser Email adresse bei uns. Um weiter zu fahren, müssen Sie sich erst einloggen. Klicken Sie auf Einloggen oder wählen sie eine andere email adresse.</p>
            <SignIn email={email} />
          </div>
        )}
        {(emailFree || me) && (
          <span>
            <H2>Zahlungsart auswählen</H2>
            <P>
              {PAYMENT_METHODS.map((pm) => (
                <span key={pm.key} style={{opacity: pm.disabled ? 0.5 : 1}}>
                  <label>
                    <input
                      type='radio'
                      name='paymentMethod'
                      disabled={pm.disabled}
                      onChange={handleChange('paymentMethod')}
                      value={pm.key} />
                    {' '}{pm.name}
                  </label><br />
                </span>
              ))}
            </P>

            {(paymentMethod === 'VISA' || paymentMethod === 'MASTERCARD') && (
              <div>
                <FieldSet
                  values={this.state.values}
                  errors={this.state.errors}
                  dirty={this.state.dirty}
                  fields={[
                    {
                      label: 'Kreditkarten-Nummer',
                      name: 'cardNumber',
                      mask: '1111 1111 1111 1111',
                      validator: (value) => (
                        (
                          !value &&
                          'Kreditkarten-Nummer fehlt'
                        ) || (
                          !window.Stripe.card.validateCardNumber(value) &&
                          'Kreditkarten-Nummer ungültig'
                        )
                      )
                    },
                    {
                      label: 'Ablauf Monat',
                      name: 'cardMonth'
                    },
                    {
                      label: 'Ablauf Jahr',
                      name: 'cardYear'
                    },
                    {
                      label: 'Prüfnummer (CVC)',
                      name: 'cardCVC',
                      validator: (value) => (
                        (
                          !value &&
                          'Prüfnummer (CVC) fehlt'
                        ) || (
                          !window.Stripe.card.validateCVC(value) &&
                          'Prüfnummer (CVC) ungültig'
                        )
                      )
                    }
                  ]}
                  onChange={(fields) => {
                    this.setState((state) => {
                      const nextState = {
                        values: {
                          ...state.values,
                          ...fields.values
                        },
                        errors: {
                          ...state.errors,
                          ...fields.errors
                        },
                        dirty: {
                          ...state.dirty,
                          ...fields.dirty
                        }
                      }

                      const month = nextState.values.cardMonth
                      const year = nextState.values.cardYear

                      if (
                        year && month &&
                        nextState.dirty.cardMonth &&
                        nextState.dirty.cardYear &&
                        !window.Stripe.card.validateExpiry(month, year)
                      ) {
                        nextState.errors.cardMonth = 'Ablauf Monat ungültig'
                        nextState.errors.cardYear = 'Ablauf Jahr ungültig'
                      } else {
                        nextState.errors.cardMonth = (
                          !month && 'Ablauf Monat fehlt'
                        )
                        nextState.errors.cardYear = (
                          !year && 'Ablauf Jahr fehlt'
                        )
                      }

                      return nextState
                    })
                  }} />
                <br /><br />
              </div>
            )}

            {!!paymentError && (
              <P style={{color: colors.error}}>
                {paymentError}
              </P>
            )}
            {!!submitError && (
              <P style={{color: colors.error}}>
                {submitError}
              </P>
            )}
            <Button onClick={submitPledge}>Weiter</Button>
          </span>
        )}

      </div>
    )
  }
}

Pledge.propTypes = {
  query: PropTypes.object.isRequired,
  client: React.PropTypes.object.isRequired,
  mutate: PropTypes.func.isRequired
}

const submitPledge = gql`
  mutation submitPledge($total: Int!, $options: [PackageOptionInput!]!, $user: PledgeUserInput, $payment: PledgePaymentInput!) {
    submitPledge(pledge: {total: $total, options: $options, user: $user, payment: $payment} ) {
      id
      total
      status
      packageId
      options {
        amount
        price
        templateId
      }
    }
  }
`

const PledgeWithSubmit = graphql(submitPledge)(withApollo(withMe(Pledge)))

export default withData(({url, session}) => (
  <Frame>
    <NarrowContainer>
      <H1>Mitmachen</H1>
      <PledgeWithSubmit query={url.query} session={session} />
    </NarrowContainer>
  </Frame>
))