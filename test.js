const fs = require('fs');
const path = require('path');

function runTests() {
  console.log('--- INICIANDO TESTES DA LANDING PAGE ---');
  let errors = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error('❌ FALHA:', message);
      errors++;
    } else {
      console.log('✅ SUCESSO:', message);
    }
  }

  // 1. Arquivos essenciais
  const requiredFiles = ['index.html', 'styles.css', 'main.js', 'package.json', 'vercel.json', 'politica-de-privacidade.html', 'termos-de-uso.html', 'favicon.svg'];
  requiredFiles.forEach(f => {
    assert(fs.existsSync(path.join(__dirname, f)), `Arquivo existe: ${f}`);
  });

  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
  const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf-8');
  const js = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf-8');

  // 2. Headings e Textos do Hero
  assert(html.includes('Sua internet está') && html.includes('lenta ou caindo?'), 'Headline do Hero presente');
  assert(html.includes('Fale agora pelo WhatsApp e veja como resolver problemas de conexão, sinal e estabilidade.'), 'Subheadline do Hero presente');
  assert(html.includes('FALAR AGORA PELO WHATSAPP'), 'Botão principal do Hero presente');
  assert(html.includes('Atendimento rápido pelo WhatsApp.'), 'Texto de apoio do Hero presente');

  // 3. Seção 2: Problemas
  assert(html.includes('Qual problema você está enfrentando?'), 'Título da Seção 2 presente');
  const requiredProblems = [
    'Internet lenta',
    'Internet caindo',
    'Sem sinal',
    'Internet travando',
    'Conexão instável',
    'Problemas frequentes de internet'
  ];
  requiredProblems.forEach(prob => {
    assert(html.includes(prob), `Problema contemplado: ${prob}`);
  });

  // 4. Seção 3: Como podemos ajudar?
  assert(html.includes('Como podemos ajudar?'), 'Título da Seção 3 presente');
  assert(html.includes('Se sua internet está lenta, caindo ou sem sinal, fale com nossa equipe pelo WhatsApp e informe o problema que está acontecendo.'), 'Texto curto da Seção 3 presente');
  assert(html.includes('CHAMAR NO WHATSAPP'), 'CTA da Seção 3 presente');

  // 5. Seção 4: Bloco forte de conversão
  assert(html.includes('Internet ruim') && html.includes('de novo?'), 'Título do Bloco forte de conversão presente');
  assert(html.includes('Fale agora e explique o que está acontecendo.'), 'Subtítulo do Bloco forte de conversão presente');
  assert(html.includes('FALAR PELO WHATSAPP'), 'CTA da Seção 4 presente');

  // 6. WhatsApp & Mensagem Pré-preenchida
  assert(js.includes('Olá! Estou com problema na minha internet e preciso de atendimento.'), 'Mensagem de saudação do WhatsApp presente');
  assert(js.includes('Problema:') && js.includes('Cidade/Bairro:') && js.includes('Internet atual:'), 'Campos pré-preenchidos do WhatsApp presentes');

  // 7. Tracking & UTMs/GCLID
  assert(js.includes('utm_source') && js.includes('gclid'), 'Preservação de UTMs e GCLID presente');
  assert(js.includes('dataLayer.push') || js.includes('window.dataLayer'), 'Disparo para dataLayer presente');
  assert(js.includes('gtag') && js.includes('conversion'), 'Evento de conversão gtag presente');

  // 8. Mobile & CSS
  assert(html.includes('mobile-sticky-bar'), 'Barra fixa inferior mobile presente');
  assert(html.includes('FALAR NO WHATSAPP AGORA'), 'CTA fixo mobile presente');
  assert(css.includes('overflow-x: hidden'), 'Proteção contra overflow horizontal presente');
  assert(css.includes('max-width'), 'Responsividade nos containers');

  // 9. SEO & Palavras-chave
  const keywords = ['internet lenta', 'internet ruim', 'internet caindo', 'internet sem sinal', 'internet fora do ar', 'internet travando', 'problema com internet', 'conexão instável', 'Nio'];
  keywords.forEach(kw => {
    assert(html.toLowerCase().includes(kw.toLowerCase()), `Palavra-chave presente no HTML: ${kw}`);
  });

  console.log('--- RESULTADO DOS TESTES ---');
  if (errors === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
  } else {
    console.error(`⚠️ ${errors} TESTES FALHARAM.`);
    process.exit(1);
  }
}

runTests();
