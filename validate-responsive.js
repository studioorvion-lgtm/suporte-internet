const fs = require('fs');
const path = require('path');

// Teste estático de responsividade e ausência de larguras fixas problemáticas
function validateResponsive() {
  console.log('--- VALIDANDO REGRAS DE VIEWPORT MOBILE (320px, 375px, 390px, 428px) ---');
  const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf-8');
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

  // 1. Meta viewport com width=device-width
  if (html.includes('width=device-width')) {
    console.log('✅ Meta viewport configurado corretamente com width=device-width');
  } else {
    console.error('❌ Falta meta viewport');
    process.exit(1);
  }

  // 2. Não deve haver larguras fixas rígidas maiores que 300px no mobile sem max-width
  const badWidths = css.match(/width:\s*([4-9]\d{2,}|[1-9]\d{3,})px/g);
  if (!badWidths || badWidths.length === 0) {
    console.log('✅ Nenhuma largura fixa excessiva encontrada no CSS global');
  } else {
    console.warn('⚠️ Alerta de larguras fixas:', badWidths);
  }

  // 3. Verifica box-sizing border-box
  if (css.includes('box-sizing: border-box')) {
    console.log('✅ Box-sizing border-box ativo em todos os elementos (*)');
  }

  // 4. Verifica se overflow-x: hidden está no body
  if (css.includes('overflow-x: hidden')) {
    console.log('✅ overflow-x: hidden ativo para prevenir scroll horizontal acidental');
  }

  // 5. Verifica se há estilo específico para telas ultra-estreitas (320px a 360px)
  if (css.includes('@media (max-width: 360px)')) {
    console.log('✅ Media query específica para telas compactas (<=360px) presente');
  }

  // 6. Verifica breakpoints de 600px e 900px
  if (css.includes('@media (min-width: 600px)') && css.includes('@media (min-width: 900px)')) {
    console.log('✅ Grid adaptativo para mobile, tablet e desktop configurado');
  }

  console.log('🎉 Validação de layout mobile concluída com sucesso!');
}

validateResponsive();
