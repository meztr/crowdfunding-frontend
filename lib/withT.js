import {getFormatter} from './utils/translate'

const MESSAGES = [
  {key: 'package/DONATE/title', value: 'Spenden – sonst nichts'},
  {key: 'package/DONATE/description', value: 'Sie wollen hervorragenden Journalismus unterstützen, ohne ihn zu lesen. Aber mit Geld. Denn Sie wissen, value: ohne Geld läuft nichts, nicht einmal die Ratten in den Lagerschuppen.'},
  {key: 'package/POSTER/title', value: 'Das Manifest'},
  {key: 'package/POSTER/description', value: 'Sie sind vorsichtig und entscheiden sich statt dem Produkt für den Bauplan des Produkts. Diesen erhalten Sie prächtig in A3, ein Schmuck für jede Wand. Aber Achtung, value: Das Magazin erhalten Sie dafür noch nicht.'},
  {key: 'package/ABO/title', value: 'Abonnement für ein Jahr'},
  {key: 'package/ABO/description', value: 'Willkommen an Bord! Sie erhalten für ein Jahr unser Magazin. Und werden zu einem kleinen Teil Mitbesitzerin.'},
  {key: 'package/ABO_GIVE/title', value: 'Abonnements verschenken'},
  {key: 'package/ABO_GIVE/description', value: 'Sie wollen Ihren Freunden oder Feinden das heisseste Magazin für ein Jahr schenken. Und haben die Gelegenheit, diesen zusätzlich für X Franken ein Notizbuch dazu zu schenken – damit diese nicht nur Cleveres lesen, sondern auch schreiben können.'},
  {key: 'package/BENEFACTOR/title', value: 'Gönner Abonnement'},
  {key: 'package/BENEFACTOR/description', value: 'Sie wollen nicht nur ein unabhängiges Magazin lesen, sondern Sie wollen sich auch nachhaltig dafür ein setzten, dass dieses existiert. Und fördern ein neues Modell für Journalismus mit dem nachdrücklichsten Argument, das möglich ist, value: mit Geld.'},
  {key: 'option/ABO/label', value: 'Mitgliedschaften'},
  {key: 'option/NOTEBOOK/label', value: 'Notizbuch'}
]

export default (Component) => (props) => (
  <Component {...props} t={getFormatter(MESSAGES)} />
)