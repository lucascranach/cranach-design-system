/**
 * Stylelint-Plugin des Cranach Design System.
 *
 * Regel cda/require-layer (ADR 0003): Jede Regel muss in einem der Layer
 * cda.tokens, cda.reset, cda.base, cda.components oder cda.utilities stehen.
 * CSS ohne Layer würde gegen alle Projekt-Styles mit Layer gewinnen und ließe sich
 * in Tailwind-Projekten nicht mehr mit Utility-Klassen überschreiben.
 *
 * Erlaubt außerhalb eines Layers: die Anweisung zur Layer-Reihenfolge (@layer a, b;),
 * @import, @charset, @font-face und @custom-media.
 */
import stylelint from 'stylelint';

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = 'cda/require-layer';
const LAYERS = ['cda.tokens', 'cda.reset', 'cda.base', 'cda.components', 'cda.utilities'];
const OUTSIDE_OK = ['import', 'charset', 'font-face', 'custom-media'];

const messages = ruleMessages(ruleName, {
  outside: (what) => `${what} steht außerhalb eines Layers. In @layer ${LAYERS.join(', ')} einordnen (ADR 0003).`,
  unknown: (name) => `Unbekannter Layer „${name}“. Erlaubt: ${LAYERS.join(', ')} (ADR 0003).`,
});

const meta = { url: 'https://github.com/lucascranach/cranach-design-system/blob/main/docs/adr/0003-praefix-und-cascade-layers.md' };

const rule = (primary) => (root, result) => {
  if (!validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;

  root.walkAtRules('layer', (atRule) => {
    // Namen prüfen – im Block wie in der Anweisung zur Reihenfolge
    for (const name of atRule.params.split(',').map((n) => n.trim())) {
      if (!LAYERS.includes(name)) {
        report({ ruleName, result, node: atRule, message: messages.unknown(name), word: name });
      }
    }
  });

  // Auf oberster Ebene darf nur stehen, was keinen Layer braucht; alles andere gehört in einen
  // @layer-Block (Verschachtelungen wie @media liegen dann innerhalb des Layers)
  root.each((node) => {
    if (node.type === 'comment') return;
    if (node.type === 'atrule' && (node.name === 'layer' || OUTSIDE_OK.includes(node.name))) return;
    const what =
      node.type === 'rule' ? `Die Regel „${node.selector}“` : node.type === 'atrule' ? `@${node.name}` : 'Die Deklaration';
    report({ ruleName, result, node, message: messages.outside(what) });
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

export default createPlugin(ruleName, rule);
