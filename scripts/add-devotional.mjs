// Befüllt content/de/<id>.json mit Katechismus, Kollekte und Lied.
// Überschreibt nur Felder die noch nicht gesetzt sind (null / undefined / fehlen).
// Aufruf: node scripts/add-devotional.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const contentDir = join(__dir, '..', 'public', 'content', 'de')

// ─── KLEINER KATECHISMUS (Luther 1529) ────────────────────────────────────────
const KC_META = { author: 'Martin Luther', source: 'Der Kleine Katechismus', year: 1529, license: 'public-domain', public_domain: true }

const KC = {
  g1:  { part: '1. Gebot', text: '»Du sollst keine andern Götter haben neben mir.« Was ist das? Wir sollen Gott über alle Dinge fürchten, lieben und vertrauen.' },
  g2:  { part: '2. Gebot', text: '»Du sollst den Namen des Herrn, deines Gottes, nicht mißbrauchen.« Was ist das? Wir sollen Gott fürchten und lieben, daß wir bei seinem Namen nicht fluchen, schwören, zaubern, lügen oder trügen, sondern ihn in allen Nöten anrufen, beten, loben und danken.' },
  g3:  { part: '3. Gebot', text: '»Du sollst den Feiertag heiligen.« Was ist das? Wir sollen Gott fürchten und lieben, daß wir die Predigt und sein Wort nicht verachten, sondern dasselbe heilig halten, gerne hören und lernen.' },
  g4:  { part: '4. Gebot', text: '»Du sollst deinen Vater und deine Mutter ehren.« Was ist das? Wir sollen Gott fürchten und lieben, daß wir unsere Eltern und Herren nicht verachten noch erzürnen, sondern sie in Ehren halten, ihnen dienen, gehorchen, sie lieben und in Wert halten.' },
  g5:  { part: '5. Gebot', text: '»Du sollst nicht töten.« Was ist das? Wir sollen Gott fürchten und lieben, daß wir unserm Nächsten an seinem Leibe keinen Schaden noch Leid tun, sondern ihm helfen und beistehen in allen Leibesnöten.' },
  g6:  { part: '6. Gebot', text: '»Du sollst nicht ehebrechen.« Was ist das? Wir sollen Gott fürchten und lieben, daß wir keusch und züchtig leben in Worten und Werken, und ein jeder seinen Ehemann oder Eheweib lieben und ehren.' },
  g7:  { part: '7. Gebot', text: '»Du sollst nicht stehlen.« Was ist das? Wir sollen Gott fürchten und lieben, daß wir unserm Nächsten sein Geld oder Gut nicht nehmen noch mit falscher Ware oder Handel an uns bringen, sondern ihm sein Gut und Nahrung helfen bessern und behüten.' },
  g8:  { part: '8. Gebot', text: '»Du sollst kein falsches Zeugnis reden wider deinen Nächsten.« Was ist das? Wir sollen Gott fürchten und lieben, daß wir unsern Nächsten nicht belügen, verraten, afterreden oder seinen Ruf verderben, sondern ihn entschuldigen, Gutes von ihm reden und alles zum Besten kehren.' },
  g9:  { part: '9. Gebot', text: '»Du sollst nicht begehren deines Nächsten Haus.« Was ist das? Wir sollen Gott fürchten und lieben, daß wir unserm Nächsten nicht mit List nach seinem Erbe oder Hause trachten und es mit einem Schein des Rechts an uns bringen, sondern ihm dasselbe erhalten, schützen und schirmen wollen.' },
  g10: { part: '10. Gebot', text: '»Du sollst nicht begehren deines Nächsten Weib, Knecht, Magd, Vieh noch alles, was sein ist.« Was ist das? Wir sollen Gott fürchten und lieben, daß wir unserm Nächsten seine Frau, Gesinde und Vieh nicht abspannen, abwenden oder abjagen, sondern veranlassen, daß sie bleiben und ihre Pflicht tun.' },

  a1: { part: '1. Artikel: Von der Schöpfung', text: '»Ich glaube an Gott, den Vater, allmächtigen, Schöpfer Himmels und der Erde.« Was ist das? Ich glaube, daß mich Gott geschaffen hat samt allen Kreaturen, mir Leib und Seele, Augen, Ohren und alle Glieder, Vernunft und alle Sinne gegeben hat und noch erhält; dazu Kleider und Schuh, Essen und Trinken, Haus und Hof, Weib und Kind, Äcker, Tiere und alle Güter, mit aller Notdurft und Nahrung des Leibes und Lebens reichlich und täglich versorgt, wider alle Fährlichkeit beschirmt und vor allem Übel behütet und bewahrt; und das alles aus lauter väterlicher, göttlicher Güte und Barmherzigkeit, ohn all mein Verdienst und Würdigkeit. Des sollt ich ihm danken und loben, dienen und gehorsam sein. Das ist gewißlich wahr.' },
  a2: { part: '2. Artikel: Von der Erlösung', text: '»Und an Jesum Christum, seinen eingeborenen Sohn, unsern Herrn …« Was ist das? Ich glaube, daß Jesus Christus, wahrhaftiger Gott, vom Vater in Ewigkeit geboren, und auch wahrhaftiger Mensch, von der Jungfrau Maria geboren, sei mein Herr, der mich verlorenen und verdammten Menschen erlöset hat, erworben, gewonnen von allen Sünden, vom Tode und von der Gewalt des Teufels, nicht mit Gold oder Silber, sondern mit seinem heiligen, teuren Blute und mit seinem unschuldigen Leiden und Sterben; auf daß ich sein eigen sei und in seinem Reich unter ihm lebe und ihm diene in ewiger Gerechtigkeit, Unschuld und Seligkeit, gleichwie er ist auferstanden vom Tode, lebet und herrschet in Ewigkeit. Das ist gewißlich wahr.' },
  a3: { part: '3. Artikel: Von der Heiligung', text: '»Ich glaube an den Heiligen Geist; eine heilige christliche Kirche …« Was ist das? Ich glaube, daß ich nicht aus eigener Vernunft noch Kraft an Jesum Christum, meinen Herrn, glauben oder zu ihm kommen kann; sondern der Heilige Geist hat mich durch das Evangelium berufen, mit seinen Gaben erleuchtet, im rechten Glauben geheiligt und erhalten; gleichwie er die ganze Christenheit auf Erden beruft, sammelt, erleuchtet, heiligt und bei Jesu Christo erhält im rechten, einigen Glauben; in welcher Christenheit er mir und allen Gläubigen täglich alle Sünden reichlich vergibt und am jüngsten Tage mich und alle Toten auferwecken wird und mir samt allen Gläubigen in Christo ein ewiges Leben geben wird. Das ist gewißlich wahr.' },

  vu0: { part: 'Das Vater Unser — Anrede', text: '»Vater unser im Himmel.« Was ist das? Gott will uns damit locken, daß wir glauben sollen, er sei unser rechter Vater und wir seine rechten Kinder, damit wir getrost und mit aller Zuversicht ihn bitten sollen, wie die lieben Kinder ihren lieben Vater.' },
  vu1: { part: '1. Bitte', text: '»Geheiligt werde dein Name.« Was ist das? Gottes Name wird wohl an sich selbst heilig gehalten; aber wir bitten in diesem Gebet, daß er auch bei uns heilig werde. Wie geschieht das? Wenn das Wort Gottes lauter und rein gelehrt wird und wir auch heilig als die Kinder Gottes danach leben.' },
  vu2: { part: '2. Bitte', text: '»Dein Reich komme.« Was ist das? Das Reich Gottes kommt wohl von sich selbst ohne unser Gebet; aber wir bitten in diesem Gebet, daß es auch zu uns komme. Wie geschieht das? Wenn der himmlische Vater uns seinen Heiligen Geist gibt, daß wir seinem heiligen Wort glauben und göttlich leben hier zeitlich und dort ewiglich.' },
  vu3: { part: '3. Bitte', text: '»Dein Wille geschehe wie im Himmel also auch auf Erden.« Was ist das? Der gute, gnädige Wille Gottes geschieht wohl ohne unser Gebet; aber wir bitten in diesem Gebet, daß er auch bei uns geschehe. Wie geschieht das? Wenn Gott allen bösen Rat und Willen bricht und hindert, die uns nicht lassen wollen das heilige Wort Gottes ehren und das Reich Gottes kommen lassen.' },
  vu4: { part: '4. Bitte', text: '»Unser täglich Brot gib uns heute.« Was ist das? Gott gibt tägliches Brot wohl ohne unser Gebet auch den bösen Menschen; aber wir bitten in diesem Gebet, daß er uns erkennen lasse, daß er es uns gibt, und wir unser täglich Brot mit Danksagung empfangen. Was heißt täglich Brot? Alles, was zur Notdurft und Nahrung unsers Leibes gehört: Essen, Trinken, Kleider, Schuh, Haus, Hof, Äcker, Vieh, Geld, Gut, fromme Eheleute, fromme Kinder, frommes Gesinde, fromme und treue Oberherren, gute Regierung, gutes Wetter, Friede, Gesundheit, Zucht, Ehre, gute Freunde, getreue Nachbarn und desgleichen.' },
  vu5: { part: '5. Bitte', text: '»Und vergib uns unsere Schuld, wie wir vergeben unsern Schuldigern.« Was ist das? Wir bitten in diesem Gebet, daß unser Vater im Himmel nicht ansehe unsere Sünden und um derselben willen solche Bitten nicht versage; denn wir sind nicht würdig, darum wir bitten, noch haben wir es verdient; sondern er wolle es uns geben aus Gnaden, wiewohl wir täglich viel sündigen und wohl eitel Strafe verdienten. So wollen auch wir herzlich vergeben und gerne Gutes tun denen, die uns wider uns sündigen.' },
  vu6: { part: '6. Bitte', text: '»Und führe uns nicht in Versuchung.« Was ist das? Gott versucht zwar niemand; aber wir bitten in diesem Gebet, daß Gott uns behüte und erhalte, damit uns der Teufel, die Welt und unser Fleisch nicht betrüge noch verführe in Mißglauben, Verzweiflung und andere große Schande und Laster; und ob wir damit angefochten würden, daß wir doch endlich gewinnen und den Sieg behalten.' },
  vu7: { part: '7. Bitte', text: '»Sondern erlöse uns von dem Übel.« Was ist das? Wir bitten in diesem Gebet als in der Summe, daß uns unser Vater im Himmel von allerlei Übel, das Leib und Seele, Gut und Ehre anfechtet, erlöse und am letzten Ende, wenn unser Stündlein kommt, ein seliges Ende beschere und mit Gnaden von diesem Jammertal zu sich nehme.' },

  taufe:    { part: 'Die Heilige Taufe', text: '»Was ist die Taufe?« Die Taufe ist nicht allein schlecht Wasser, sondern sie ist das Wasser in Gottes Gebot gefaßt und mit Gottes Wort verbunden. — »Was nützt, gibt und schaffet die Taufe?« Sie wirket Vergebung der Sünden, erlöset vom Tode und Teufel und gibt die ewige Seligkeit allen, die es glauben, wie die Worte und Verheißung Gottes lauten: Wer da glaubet und getauft wird, der wird selig werden; wer aber nicht glaubet, der wird verdammt werden.' },
  beichte:  { part: 'Die Beichte', text: '»Was ist die Beichte?« Die Beichte begreift zwei Stücke in sich: Eins, daß man die Sünden bekenne; das andere, daß man die Absolution oder Vergebung vom Beichtvater empfange als von Gott selbst. — »Was soll man von der Absolution halten?« Man soll nicht zweifeln, sondern gewiß glauben, daß damit die Sünde vergeben sei vor Gott im Himmel, weil sie durch das Wort Gottes und das Gebot Gottes aufgerichtet ist.' },
  abendmahl:{ part: 'Das heilige Abendmahl', text: '»Was ist das Sakrament des Altars?« Es ist der wahre Leib und Blut unsers Herrn Jesu Christi, unter dem Brot und Wein uns Christen zu essen und zu trinken von Christus selbst eingesetzt. — »Was nützt solch Essen und Trinken?« Das zeigen uns diese Worte: »für euch gegeben« und »vergossen zur Vergebung der Sünden«; nämlich daß uns im Sakrament Vergebung der Sünden, Leben und Seligkeit durch solche Worte gegeben wird; denn wo Vergebung der Sünden ist, da ist auch Leben und Seligkeit.' },
}

// ─── KATECHISMUS-ZUTEILUNG ────────────────────────────────────────────────────
const DAY_KC = {
  'advent-1': 'a1', 'advent-2': 'a1', 'advent-3': 'vu1', 'advent-4': 'vu2',
  'christfest-1': 'a2', 'christfest-2': 'a2', 'sonntag-nach-weihnachten': 'a2', 'neujahr': 'a1',
  'epiphanias': 'a2', 'epiphanias-1': 'a2', 'epiphanias-2': 'a2', 'epiphanias-3': 'a2',
  'epiphanias-4': 'g5', 'epiphanias-5': 'g8', 'epiphanias-6': 'a1',
  'septuagesimae': 'g1', 'sexagesimae': 'g3', 'estomihi': 'a2',
  'aschermittwoch': 'vu5', 'invocavit': 'vu6', 'reminiscere': 'vu3',
  'oculi': 'a2', 'laetare': 'a2', 'judika': 'a2', 'palmarum': 'a2',
  'gruendonnerstag': 'abendmahl', 'karfreitag': 'a2',
  'ostersonntag': 'a2', 'ostermontag': 'a2', 'quasimodogeniti': 'taufe',
  'misericordias': 'a2', 'jubilate': 'a3', 'cantate': 'a3',
  'rogate': 'vu2', 'himmelfahrt': 'a2', 'exaudi': 'a3',
  'pfingstsonntag': 'a3', 'pfingstmontag': 'a3',
  'trinitatis': 'a1',
  'trinitatis-1': 'g5',  'trinitatis-2': 'vu2',  'trinitatis-3': 'vu5',
  'trinitatis-4': 'g5',  'trinitatis-5': 'g3',   'trinitatis-6': 'g1',
  'trinitatis-7': 'a1',  'trinitatis-8': 'g1',   'trinitatis-9': 'vu4',
  'trinitatis-10': 'vu1','trinitatis-11': 'beichte','trinitatis-12': 'a3',
  'trinitatis-13': 'g5', 'trinitatis-14': 'vu5', 'trinitatis-15': 'vu4',
  'trinitatis-16': 'a2', 'trinitatis-17': 'g4',  'trinitatis-18': 'g1',
  'trinitatis-19': 'beichte','trinitatis-20': 'abendmahl',
  'trinitatis-21': 'a2', 'trinitatis-22': 'vu5', 'trinitatis-23': 'g2',
  'trinitatis-24': 'a2', 'trinitatis-25': 'vu7', 'trinitatis-26': 'vu7',
  'trinitatis-27': 'a3',
}

// ─── KOLLEKTEN ────────────────────────────────────────────────────────────────
// Saisonale Gebete nach lutherischer Agendetradition (PRÜFPFLICHT: Quellenverifikation)
const KOLLEKTE_META = { author: 'Lutherische Agendetradition', license: 'public-domain', public_domain: true }

const KOLLEKTEN = {
  advent:     'Rühre unsere Herzen, o Herr, damit wir dir die Wege bereiten und deinem kommenden Sohn im Glauben begegnen mögen. Der da kommt im Namen des HERRN — Hosianna in der Höhe! Durch denselben, deinen Sohn, Jesus Christus, unsern Herrn, der mit dir und dem Heiligen Geist lebt und regiert in Ewigkeit. Amen.',
  weihnachten:'Allmächtiger Gott, du hast deinen eingeborenen Sohn gesandt, unser Fleisch anzunehmen und als ein Licht in unsere Dunkelheit zu leuchten: Gib, daß wir ihn im Glauben erkennen und ihm in Ewigkeit nachfolgen, der da lebt und regiert mit dir und dem Heiligen Geist, ein Gott, von Ewigkeit zu Ewigkeit. Amen.',
  epiphanias: 'Herr, unser Gott, der du durch einen Stern die Weisen gerufen hast, deinen Sohn anzubeten: Erleuchte auch uns durch das Licht deines Wortes, damit wir ihn als König aller Könige erkennen und ihm allein dienen, der da lebt und regiert mit dir und dem Heiligen Geist in Ewigkeit. Amen.',
  vorfasten:  'Barmherziger Gott, der du uns täglich rufst, in deinem Dienst zu wandeln: Stärke uns durch dein Wort, damit wir in der Kraft des Glaubens ausharren und das Ziel der ewigen Seligkeit erlangen. Durch Jesus Christus, deinen Sohn, unsern Herrn. Amen.',
  passion:    'Herr Jesu Christe, du hast um unserer Sünden willen gelitten und bist gestorben: Gib uns ein bußfertiges Herz, daß wir täglich Abstand nehmen von allem, was dich betrübt, und in der Kraft deines Leidens dem ewigen Leben entgegengehen. Amen.',
  karfreitag: 'O Herr Jesu Christe, Sohn des lebendigen Gottes, der du am Kreuz gestorben bist für unsere Sünden: Laß dein Leiden uns täglich vor Augen stehen, damit wir einsehen, wie teuer wir erkauft sind, und dir allein gehören in Zeit und Ewigkeit. Amen.',
  ostern:     'Allmächtiger Gott, du hast deinen Sohn von den Toten auferweckt und uns dadurch Hoffnung auf das ewige Leben geschenkt: Gib uns Glauben, der den Tod überwindet, damit wir dereinst mit allen Gläubigen auferstehen zur Herrlichkeit. Durch denselben, deinen Sohn, Jesus Christus, unsern auferstandenen Herrn. Amen.',
  pfingsten:  'Komm, Heiliger Geist, Herre Gott, und erfülle unsere Herzen mit deiner Gnade: Berufe, erleuchte und heilige uns, damit wir im rechten Glauben bleiben und im ewigen Leben vollendet werden. Durch Jesus Christus, unsern Herrn. Amen.',
  trinitatis: 'Heiliger, dreieiniger Gott, Vater, Sohn und Heiliger Geist: Gib, daß wir in deiner Gnade wandeln, dein Wort in uns wohnen lassen und dereinst das Angesicht schauen dürfen, dem allein Ehre, Lob und Anbetung gebührt von Ewigkeit zu Ewigkeit. Amen.',
}

const DAY_KOLLEKTE = {
  'advent-1': 'advent', 'advent-2': 'advent', 'advent-3': 'advent', 'advent-4': 'advent',
  'christfest-1': 'weihnachten', 'christfest-2': 'weihnachten',
  'sonntag-nach-weihnachten': 'weihnachten', 'neujahr': 'weihnachten',
  'epiphanias': 'epiphanias', 'epiphanias-1': 'epiphanias', 'epiphanias-2': 'epiphanias',
  'epiphanias-3': 'epiphanias', 'epiphanias-4': 'epiphanias', 'epiphanias-5': 'epiphanias', 'epiphanias-6': 'epiphanias',
  'septuagesimae': 'vorfasten', 'sexagesimae': 'vorfasten', 'estomihi': 'vorfasten',
  'aschermittwoch': 'passion', 'invocavit': 'passion', 'reminiscere': 'passion',
  'oculi': 'passion', 'laetare': 'passion', 'judika': 'passion', 'palmarum': 'passion',
  'gruendonnerstag': 'passion', 'karfreitag': 'karfreitag',
  'ostersonntag': 'ostern', 'ostermontag': 'ostern', 'quasimodogeniti': 'ostern',
  'misericordias': 'ostern', 'jubilate': 'ostern', 'cantate': 'ostern',
  'rogate': 'ostern', 'himmelfahrt': 'ostern', 'exaudi': 'ostern',
  'pfingstsonntag': 'pfingsten', 'pfingstmontag': 'pfingsten',
}
// Alle Trinitatis-Tage
for (let n = 0; n <= 27; n++) {
  DAY_KOLLEKTE[n === 0 ? 'trinitatis' : `trinitatis-${n}`] = 'trinitatis'
}

// ─── LIEDER ──────────────────────────────────────────────────────────────────
const LIEDER = {
  'advent': {
    title: 'Macht hoch die Tür',
    author: 'Georg Weissel', year: 1635, license: 'public-domain', public_domain: true,
    source: 'Preußisches Fest-Lied-Buch, 1642',
    stanzas: [
      'Macht hoch die Tür, die Tor macht weit;\nes kommt der Herr der Herrlichkeit,\nein König aller Königreich,\nein Heiland aller Welt zugleich,\nder Heil und Leben mit sich bringt;\nderhalben jauchzt, mit Freuden singt:\nGelobet sei mein Gott,\nmein Schöpfer reich von Rat.',
    ],
  },
  'advent-wie-soll': {
    title: 'Wie soll ich dich empfangen',
    author: 'Paul Gerhardt', year: 1653, license: 'public-domain', public_domain: true,
    source: 'Praxis Pietatis Melica, 1653',
    stanzas: [
      'Wie soll ich dich empfangen\nund wie begegn ich dir?\nO aller Welt Verlangen,\no meiner Seele Zier!\nO Jesu, Jesu, setze\nmir selbst die Fackel bei,\ndamit, was dich ergötze,\nmir kund und wissend sei.',
    ],
  },
  'christfest': {
    title: 'Vom Himmel hoch, da komm ich her',
    author: 'Martin Luther', year: 1535, license: 'public-domain', public_domain: true,
    source: 'Klug\'sches Gesangbuch, 1535',
    stanzas: [
      'Vom Himmel hoch, da komm ich her,\nich bring euch gute neue Mär,\nder guten Mär bring ich so viel,\ndavon ich singen und sagen will.',
      'Euch ist ein Kindlein heut geborn\nvon einer Jungfrau auserkorn,\nein Kindelein so zart und fein,\ndas soll eu’r Freud und Wonne sein.',
    ],
  },
  'epiphanias': {
    title: 'Wie schön leuchtet der Morgenstern',
    author: 'Philipp Nicolai', year: 1599, license: 'public-domain', public_domain: true,
    source: 'Freudenspiegel des ewigen Lebens, 1599',
    stanzas: [
      'Wie schön leuchtet der Morgenstern\nvoll Gnad und Wahrheit von dem Herrn,\ndie süße Wurzel Isai!\nDu Sohn Davids aus Jakobs Stamm,\nmein König und mein Bräutigam,\nhast mir mein Herz besessen.\nLieblich, freundlich, schön und herrlich,\ngroß und ehrlich, reich von Gaben,\nhoch und sehr prächtig erhaben.',
    ],
  },
  'passion': {
    title: 'Herzliebster Jesu, was hast du verbrochen',
    author: 'Johann Heermann', year: 1630, license: 'public-domain', public_domain: true,
    source: 'Devoti Musica Cordis, 1630',
    stanzas: [
      'Herzliebster Jesu, was hast du verbrochen,\ndaß man ein solch hart Urteil hat gesprochen?\nWas ist die Schuld, in was für Mißetaten\nbist du geraten?',
      'Du wirst gegeißelt und mit Dorn gekrönet,\nins Angesicht geschlagen und verhöhnet,\ndu wirst mit Essig und mit Gall getränket,\nans Kreuz gehenket.',
    ],
  },
  'karfreitag': {
    title: 'O Haupt voll Blut und Wunden',
    author: 'Paul Gerhardt', year: 1647, license: 'public-domain', public_domain: true,
    source: 'Praxis Pietatis Melica, 1647',
    stanzas: [
      'O Haupt voll Blut und Wunden,\nvoll Schmerz und voller Hohn,\no Haupt, zu Spott gebunden\nmit einer Dornenkron,\no Haupt, sonst schön gezieret\nmit höchster Ehr und Zier,\njetzt aber hoch schimpfieret:\ngegrüßet seist du mir!',
    ],
  },
  'ostern': {
    title: 'Christ lag in Todesbanden',
    author: 'Martin Luther', year: 1524, license: 'public-domain', public_domain: true,
    source: 'Enchiridion, 1524',
    stanzas: [
      'Christ lag in Todesbanden,\nfür unsre Sünd gegeben,\nder ist wieder erstanden\nund hat uns Licht gebracht;\ndes wir sollen fröhlich sein,\nGott loben und dankbar sein\nund singen Hallelujah,\nHallelujah!',
    ],
  },
  'pfingsten': {
    title: 'Komm, Heiliger Geist, Herre Gott',
    author: 'Martin Luther', year: 1524, license: 'public-domain', public_domain: true,
    source: 'Enchiridion, 1524',
    stanzas: [
      'Komm, Heiliger Geist, Herre Gott,\nerfüll mit deiner Gnaden Gut\ndeiner Gläubigen Herz, Mut und Sinn;\ndein brünstig Lieb entzünd in ihn.\nO Herr, durch deines Lichtes Glast\nzu dem Glauben versammelt hast\ndas Volk aus aller Welt Zungen:\ndas sei dir, Herr, zu Lob gesungen,\nHallelujah, Hallelujah!',
    ],
  },
  'trinitatis-fest': {
    title: 'Allein Gott in der Höh sei Ehr',
    author: 'Nikolaus Decius', year: 1525, license: 'public-domain', public_domain: true,
    source: 'Rostock, 1525',
    stanzas: [
      'Allein Gott in der Höh sei Ehr\nund Dank für seine Gnade,\ndarum daß nun und nimmermehr\nuns rühren kann kein Schade;\nein Wohlgefalln Gott an uns hat,\nnum ist groß Fried ohn Unterlaß,\nall Fehde hat ein Ende.',
    ],
  },
  'trinitatis-wer-nur': {
    title: 'Wer nur den lieben Gott läßt walten',
    author: 'Georg Neumark', year: 1641, license: 'public-domain', public_domain: true,
    source: 'Fortgepflanzter musikalisch-poetischer Lustwald, 1657',
    stanzas: [
      'Wer nur den lieben Gott läßt walten\nund hoffet auf ihn allezeit,\nden wird er wunderbar erhalten\nin aller Not und Traurigkeit.\nWer Gott, dem Allerhöchsten, traut,\nder hat auf keinen Sand gebaut.',
    ],
  },
  'trinitatis-befiehl': {
    title: 'Befiehl du deine Wege',
    author: 'Paul Gerhardt', year: 1647, license: 'public-domain', public_domain: true,
    source: 'Praxis Pietatis Melica, 1647',
    stanzas: [
      'Befiehl du deine Wege\nund was dein Herze kränkt\nder allertreusten Pflege\ndes, der den Himmel lenkt.\nDer Wolken, Luft und Winden\ngibt Wege, Lauf und Bahn,\nder wird auch Wege finden,\nda dein Fuß gehen kann.',
    ],
  },
  'trinitatis-nun-danket': {
    title: 'Nun danket alle Gott',
    author: 'Martin Rinkart', year: 1636, license: 'public-domain', public_domain: true,
    source: 'Jesu Herz-Büchlein, 1636',
    stanzas: [
      'Nun danket alle Gott\nmit Herzen, Mund und Händen,\nder große Dinge tut\nan uns und allen Enden,\nder uns von Mutterleib\nund Kindesbeinen an\nungezählet viel Guts\nerzeiget hat und noch.',
    ],
  },
  'christfest-2-tag': {
    title: 'Gelobet seist du, Jesu Christ',
    author: 'Martin Luther', year: 1524, license: 'public-domain', public_domain: true,
    source: 'Enchiridion, 1524',
    stanzas: [
      'Gelobet seist du, Jesu Christ,\ndaß du Mensch geboren bist\nvon einer Jungfrau, das ist wahr;\ndes freuet sich der Engel Schar.\nKyrieleison.',
    ],
  },
  'gruendonnerstag-lied': {
    title: 'Jesus Christus, unser Heiland, der von uns den Zorn Gottes wandt',
    author: 'Martin Luther', year: 1524, license: 'public-domain', public_domain: true,
    source: 'Enchiridion, 1524',
    stanzas: [
      'Jesus Christus, unser Heiland,\nder von uns den Zorn Gottes wandt,\ndurch das bitter Leiden sein\nhalf er uns aus der Höllen Pein.',
      'Daß wir nimmer des vergessen,\ngab er uns sein Leib zu essen,\nverborgen im Brot so klein,\nund zu trinken sein Blut im Wein.',
    ],
  },
  'vorfasten': {
    title: 'Ach Gott, vom Himmel sieh darein',
    author: 'Martin Luther', year: 1524, license: 'public-domain', public_domain: true,
    source: 'Enchiridion, 1524',
    stanzas: [
      'Ach Gott, vom Himmel sieh darein\nund laß dich des erbarmen;\nwie wenig sind der Heilgen dein,\nverlassen sind wir Armen.\nDein Wort man nicht läßt haben wahr,\nder Glaub ist auch verloschen gar\nbei allen Menschenkindern.',
    ],
  },
}

// Lied-Zuteilung pro Tag
const DAY_LIED = {
  'advent-1': 'advent', 'advent-2': 'advent-wie-soll',
  'advent-3': 'advent', 'advent-4': 'advent-wie-soll',
  'christfest-1': 'christfest', 'christfest-2': 'christfest-2-tag',
  'sonntag-nach-weihnachten': 'christfest', 'neujahr': 'christfest',
  'epiphanias': 'epiphanias', 'epiphanias-1': 'epiphanias',
  'epiphanias-2': 'epiphanias', 'epiphanias-3': 'epiphanias',
  'epiphanias-4': 'epiphanias', 'epiphanias-5': 'epiphanias', 'epiphanias-6': 'epiphanias',
  'septuagesimae': 'vorfasten', 'sexagesimae': 'vorfasten', 'estomihi': 'passion',
  'aschermittwoch': 'passion', 'invocavit': 'passion', 'reminiscere': 'passion',
  'oculi': 'passion', 'laetare': 'passion', 'judika': 'passion',
  'palmarum': 'karfreitag',
  'gruendonnerstag': 'gruendonnerstag-lied', 'karfreitag': 'karfreitag',
  'ostersonntag': 'ostern', 'ostermontag': 'ostern', 'quasimodogeniti': 'ostern',
  'misericordias': 'ostern', 'jubilate': 'ostern', 'cantate': 'ostern',
  'rogate': 'ostern', 'himmelfahrt': 'ostern', 'exaudi': 'ostern',
  'pfingstsonntag': 'pfingsten', 'pfingstmontag': 'pfingsten',
  'trinitatis': 'trinitatis-fest',
  'trinitatis-1': 'trinitatis-wer-nur',  'trinitatis-2': 'trinitatis-befiehl',
  'trinitatis-3': 'trinitatis-wer-nur',  'trinitatis-4': 'trinitatis-befiehl',
  'trinitatis-5': 'trinitatis-wer-nur',  'trinitatis-6': 'trinitatis-fest',
  'trinitatis-7': 'trinitatis-nun-danket','trinitatis-8': 'trinitatis-befiehl',
  'trinitatis-9': 'trinitatis-wer-nur',  'trinitatis-10': 'trinitatis-befiehl',
  'trinitatis-11': 'trinitatis-fest',    'trinitatis-12': 'trinitatis-nun-danket',
  'trinitatis-13': 'trinitatis-befiehl', 'trinitatis-14': 'trinitatis-wer-nur',
  'trinitatis-15': 'trinitatis-befiehl', 'trinitatis-16': 'trinitatis-nun-danket',
  'trinitatis-17': 'trinitatis-fest',    'trinitatis-18': 'trinitatis-befiehl',
  'trinitatis-19': 'trinitatis-wer-nur', 'trinitatis-20': 'trinitatis-fest',
  'trinitatis-21': 'trinitatis-befiehl', 'trinitatis-22': 'trinitatis-wer-nur',
  'trinitatis-23': 'trinitatis-nun-danket','trinitatis-24': 'trinitatis-befiehl',
  'trinitatis-25': 'trinitatis-wer-nur', 'trinitatis-26': 'trinitatis-nun-danket',
  'trinitatis-27': 'trinitatis-fest',
}

// ─── HAUPTLOGIK ───────────────────────────────────────────────────────────────
const allIds = [
  'advent-1','advent-2','advent-3','advent-4',
  'christfest-1','christfest-2','sonntag-nach-weihnachten','neujahr',
  'epiphanias','epiphanias-1','epiphanias-2','epiphanias-3','epiphanias-4','epiphanias-5','epiphanias-6',
  'septuagesimae','sexagesimae','estomihi',
  'aschermittwoch','invocavit','reminiscere','oculi','laetare','judika','palmarum',
  'gruendonnerstag','karfreitag',
  'ostersonntag','ostermontag','quasimodogeniti','misericordias','jubilate','cantate',
  'rogate','himmelfahrt','exaudi',
  'pfingstsonntag','pfingstmontag',
  'trinitatis',
  ...Array.from({length: 27}, (_, i) => `trinitatis-${i + 1}`),
]

let updated = 0
for (const id of allIds) {
  const file = join(contentDir, `${id}.json`)
  if (!existsSync(file)) { console.log(`  SKIP (kein JSON): ${id}`); continue }

  const data = JSON.parse(readFileSync(file, 'utf8'))
  let changed = false

  // Katechismus
  if (!data.catechism_segment && DAY_KC[id]) {
    const kc = KC[DAY_KC[id]]
    data.catechism_segment = { ...kc, ...KC_META }
    changed = true
  }

  // Kollekte
  if (!data.collect && DAY_KOLLEKTE[id]) {
    data.collect = {
      text: KOLLEKTEN[DAY_KOLLEKTE[id]],
      ...KOLLEKTE_META,
    }
    changed = true
  }

  // Lied
  if (!data.hymn && DAY_LIED[id]) {
    data.hymn = { ...LIEDER[DAY_LIED[id]] }
    changed = true
  }

  if (changed) {
    writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
    console.log(`  ✓ ${id}`)
    updated++
  }
}
console.log(`\nFertig: ${updated} Dateien aktualisiert.`)
