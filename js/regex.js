/*
  All regular expressions that will be used by the application.
*/

module.exports = {
  'NOOB': /^NOOB$/,

  'TROOF': /^(WIN|FAIL)$/,

  'NUMBR': /^-?\d+$/,

  'NUMBAR': /^-?\d+\.\d+$/,

  'YARN': /^".*"$/,

  'variable': /^[A-Za-z][A-Za-z0-9_]*$/,

  'literal': /^(NOOB|WIN|FAIL|-?\d+|-?\d+\.\d+|".*"|[A-Za-z][A-Za-z0-9_]*|")$/,

  'expression': /^(SUM OF .+ AN .+|DIFF OF .+ AN .+|PRODUKT OF .+ AN .+|QUOSHUNT OF .+ AN .+|MOD OF .+ AN .+|BIGGR OF .+ AN .+|SMALLR OF .+ AN .+|BOTH OF .+ AN .+|EITHER OF .+ AN .+|WON OF .+ AN .+|NOT .+|ALL OF .+ AN .+ MKAY|EITHER OF .+ AN .+ MKAY|BOTH SAEM .+ AN .+|DIFFRINT .+ AN .+|ALL OF .+|ANY OF .+|SMOOSH .+|VISIBLE .+)$/,

  'expressionToken': /^(SUM OF|DIFF OF|PRODUKT OF|QUOSHUNT OF|MOD OF|BIGGR OF|SMALLR OF|BOTH OF|EITHER OF|WON OF|NOT|ALL OF|ANY OF|BOTH SAEM|DIFFRINT|SMOOSH|VISIBLE)$/,

  'unary': /^NOT/,

  'binary': /^(SUM OF|DIFF OF|PRODUKT OF|QUOSHUNT OF|MOD OF|BIGGR OF|SMALLR OF|BOTH OF|EITHER OF|WON OF|BOTH SAEM|DIFFRINT)/,

  'infinity': /^(ALL OF|ANY OF|SMOOSH|VISIBLE)/,

  'HAI': /^\s*HAI\s*$/,

  'KTHXBYE': /^\s*KTHXBYE\s*$/,

  'VISIBLE': /^\s*VISIBLE\s+/,

  'IHASA': /\s*I HAS A\s+/,

  'ITZ': / ITZ /,

  'GIMMEH': /\s*GIMMEH\s+/,

  'R': /\s*[A-Za-z][A-Za-z0-9_]*\s+R\s+.+\s*$/,

  'SMOOSH': /\s*SMOOSH\s+/,

  'BTW': /\s*BTW\s*.*$/,

  'OBTW': /\s*OBTW\s*.*$/,

  'SUMOF': /^\s*SUM OF\s+/,

  'DIFFOF': /^\s*DIFF OF\s+/,

  'PRODUKTOF': /^\s*PRODUKT OF\s+/,

  'QUOSHUNTOF': /^\s*QUOSHUNT OF\s+/,

  'MODOF': /^\s*MOD OF\s+/,

  'BIGGROF': /^\s*BIGGR OF\s+/,

  'SMALLROF': /^\s*SMALLR OF\s+/,

  'BOTHOF': /^\s*BOTH OF\s+/,

  'EITHEROF': /^\s*EITHER OF\s+/,

  'WONOF': /^\s*WON OF\s+/,

  'NOT': /^\s*NOT\s+/,

  'ALLOF': /^\s*ALL OF\s+/,

  'ANYOF': /^\s*ANY OF\s+/,

  'SMOOSH': /^\s*SMOOSH\s+/,

  'TLDR': /^\s*TLDR\s*$/,

  'ORLY': /^\s*O RLY\?\s*$/,

  'YARLY': /^\s*YA RLY\s*$/,

  'NOWAI': /^\s*NO WAI\s*$/,

  'OIC': /^\s*OIC\s*$/,

  'WTF': /^\s*WTF\?\s*$/,

  'OMG': /^\s*OMG\s*/,

  'GTFO': /^\s*GTFO\s*$/,

  'OMGWTF': /^\s*OMGWTF\s*$/,

  'BOTHSAEM': /^\s*BOTH SAEM\s+/,

  'DIFFRINT': /^\s*DIFFRINT\s+/,

  'arithmeticExpression': /^(SUM OF|DIFF OF|PRODUKT OF|QUOSHUNT OF|MOD OF|BIGGR OF|SMALLR OF)$/,

  'booleanExpression': /^(BOTH OF|EITHER OF|WON OF|NOT|DIFFRINT)$/,

  'reserved' : /^(HAI|KTHXBYE|NOT|ITZ|GIMMEH|NOOB|TROOF|NUMBR|NUMBAR|YARN|VISIBLE|R|SMOOSH|BTW|OBTW|TLDR|OIC|BUKKIT)*$/
};
