# PROMPT MASTER — SISTEMA DE CÁLCULO DE NOTAS A1, A2 E A3

Atue como um **PhD em Engenharia de Software, Sistemas Low-Code/No-Code, UX/UI Design e Engenharia de Requisitos**, com experiência em desenvolvimento de aplicações educacionais.

Quero desenvolver um software web chamado **Calculadora de Notas A1, A2 e A3**, cujo objetivo é permitir que estudantes convertam as notas divulgadas pelo professor em uma escala de **1 a 100**, compreendendo de forma clara qual foi o desempenho percentual obtido.

O sistema deve priorizar:

* simplicidade;
* excelente UX;
* poucos passos para realizar um cálculo;
* interface intuitiva;
* acessibilidade;
* feedback visual imediato;
* histórico/memória das pesquisas realizadas;
* funcionamento responsivo em computador e celular;
* arquitetura simples e fácil de manter.

---

## 1. REGRA ACADÊMICA

A disciplina possui três avaliações:

* **A1 = 30 pontos**
* **A2 = 30 pontos**
* **A3 = 40 pontos**

Total máximo:

**100 pontos**

As notas divulgadas pelo professor são valores inteiros correspondentes aos pontos obtidos em cada avaliação.

Exemplo:

A1 possui valor máximo de 30 pontos.

Se o professor divulgou:

**A1 = 21**

então:

21 / 30 × 100 = **70%**

Portanto, a equivalência percentual da A1 é:

**70/100**

Outro exemplo:

A2 = 24

24 / 30 × 100 = **80%**

A3 = 32

32 / 40 × 100 = **80%**

Nesse caso:

A1 + A2 + A3 = 21 + 24 + 32 = **77 pontos de 100**

Resultado final:

**77/100**

---

# 2. OBJETIVO PRINCIPAL

O sistema deve permitir que o usuário informe:

* nota da A1;
* nota da A2;
* nota da A3.

Após o preenchimento, o sistema deve apresentar:

### Resultado geral

**Nota final: 77/100**

### Desempenho percentual

**77%**

### Desempenho por avaliação

A1:
**21/30 → 70%**

A2:
**24/30 → 80%**

A3:
**32/40 → 80%**

O resultado deve ser apresentado de maneira visual e extremamente fácil de compreender.

---

# 3. CONCEITO DE "NOTA EXATA"

É importante não afirmar que o sistema consegue recuperar casas decimais que não foram divulgadas pelo professor.

O sistema deve trabalhar com os valores inteiros efetivamente informados.

Portanto, se o professor divulgou:

**A1 = 21**

o sistema deve informar:

**21 de 30 pontos = 70%**

Não inventar ou estimar valores decimais que não estejam presentes nos dados fornecidos.

Utilizar o termo **"equivalência percentual"** quando apropriado.

---

# 4. UX — PRINCÍPIO FUNDAMENTAL

A aplicação deve ser projetada segundo o princípio:

> **"O usuário deve conseguir calcular sua nota sem precisar aprender a usar o sistema."**

O usuário não deve precisar entender fórmulas matemáticas para utilizar a aplicação.

A interface deve conduzi-lo naturalmente:

**Inserir notas → Calcular → Visualizar resultado**

Evitar:

* menus desnecessários;
* excesso de informações;
* telas complexas;
* formulários longos;
* termos técnicos;
* elementos visuais que não agreguem valor.

---

# 5. TELA PRINCIPAL

Criar uma interface moderna, limpa e acadêmica.

No topo:

**Calculadora de Notas**

Subtítulo:

**Descubra sua nota final e a equivalência percentual das avaliações.**

Criar três campos principais:

### A1

Label:

**Nota A1**

Informação auxiliar:

**Máximo: 30 pontos**

Input numérico.

### A2

Label:

**Nota A2**

Informação auxiliar:

**Máximo: 30 pontos**

Input numérico.

### A3

Label:

**Nota A3**

Informação auxiliar:

**Máximo: 40 pontos**

Input numérico.

Adicionar um botão principal:

**Calcular minha nota**

---

# 6. VALIDAÇÃO DOS CAMPOS

A aplicação deve validar os valores antes do cálculo.

A1:

* mínimo: 0
* máximo: 30

A2:

* mínimo: 0
* máximo: 30

A3:

* mínimo: 0
* máximo: 40

Não permitir:

* valores negativos;
* valores acima do limite;
* caracteres inválidos;
* valores vazios quando o usuário solicitar o cálculo.

Caso o usuário informe A1 = 35, apresentar uma mensagem amigável:

**"A A1 vale no máximo 30 pontos."**

Não utilizar mensagens técnicas como:

**"Invalid input"**

ou:

**"ValueError"**

A linguagem deve ser orientada ao usuário.

---

# 7. CÁLCULO

Implementar as seguintes fórmulas.

### A1

```text
percentualA1 = (A1 / 30) × 100
```

### A2

```text
percentualA2 = (A2 / 30) × 100
```

### A3

```text
percentualA3 = (A3 / 40) × 100
```

### Nota final

Como os pesos já correspondem aos valores máximos das avaliações:

```text
notaFinal = A1 + A2 + A3
```

O resultado máximo será:

```text
30 + 30 + 40 = 100
```

Portanto:

```text
notaFinal = 0 até 100
```

---

# 8. RESULTADO VISUAL

Após clicar em "Calcular minha nota", apresentar um card de resultado em destaque.

Exemplo:

━━━━━━━━━━━━━━━━━━━━

**SUA NOTA FINAL**

# 77/100

**77% de aproveitamento**

━━━━━━━━━━━━━━━━━━━━

Abaixo, mostrar:

| Avaliação | Nota  | Equivalência |
| --------- | ----- | ------------ |
| A1        | 21/30 | 70%          |
| A2        | 24/30 | 80%          |
| A3        | 32/40 | 80%          |

Utilizar componentes visuais para facilitar a interpretação.

Por exemplo:

A1
██████████████░░░░░░ 70%

A2
████████████████░░░░ 80%

A3
████████████████░░░░ 80%

---

# 9. FEEDBACK VISUAL

Após o cálculo, apresentar uma classificação visual baseada na nota final.

Sugestão:

* 0–49: baixo desempenho
* 50–59: atenção
* 60–69: desempenho regular
* 70–79: bom desempenho
* 80–89: ótimo desempenho
* 90–100: excelente desempenho

Essas classificações devem ser apresentadas como **indicadores visuais**, e não como critérios oficiais de aprovação.

Nunca afirmar que o estudante está aprovado ou reprovado, a menos que exista uma regra oficial de aprovação configurada no sistema.

---

# 10. MEMÓRIA DE PESQUISA / HISTÓRICO

Implementar uma funcionalidade chamada:

**Histórico de cálculos**

Sempre que o usuário realizar um cálculo, salvar a pesquisa localmente.

Cada registro deve conter:

* data;
* hora;
* A1;
* A2;
* A3;
* nota final;
* percentual final.

Exemplo:

### Histórico

**10/08/2026 — 19:32**

A1: 21
A2: 24
A3: 32

**Resultado: 77/100**

---

# 11. ARMAZENAMENTO

Para uma primeira versão, utilizar:

**localStorage**

Não criar banco de dados ou backend desnecessariamente.

O histórico deve permanecer disponível mesmo depois que o usuário fechar e reabrir o navegador.

Criar funções bem separadas para:

```text
saveCalculation()
getCalculationHistory()
deleteCalculation()
clearHistory()
```

O histórico deve permitir:

* visualizar cálculo anterior;
* reutilizar cálculo;
* excluir um registro;
* limpar todo o histórico.

Antes de apagar todo o histórico, solicitar confirmação.

Mensagem:

**"Tem certeza que deseja apagar todo o histórico?"**

Botões:

**Cancelar**

**Apagar histórico**

---

# 12. PRIVACIDADE

Informar discretamente que:

**"Seus cálculos são armazenados apenas neste dispositivo."**

Não enviar os dados para servidores externos.

Não solicitar login na primeira versão.

Não coletar informações pessoais desnecessárias.

---

# 13. MICROINTERAÇÕES

Adicionar pequenas animações para melhorar a percepção de qualidade.

Exemplos:

* botão com feedback ao clicar;
* resultado aparecendo suavemente;
* barras de progresso sendo preenchidas;
* campos indicando erro;
* transição suave entre estados;
* confirmação visual ao salvar histórico.

As animações devem ser discretas.

Não utilizar animações excessivas.

---

# 14. RESPONSIVIDADE

A aplicação deve funcionar perfeitamente em:

* desktop;
* notebook;
* tablet;
* smartphone.

No celular:

Os campos A1, A2 e A3 devem aparecer verticalmente.

O botão "Calcular minha nota" deve ocupar uma área confortável para toque.

O resultado deve ser facilmente legível sem necessidade de zoom.

---

# 15. ACESSIBILIDADE

Aplicar boas práticas de acessibilidade:

* labels associados aos inputs;
* contraste adequado;
* foco visível;
* navegação por teclado;
* mensagens de erro compreensíveis;
* não depender exclusivamente de cores para comunicar informações;
* botões com áreas adequadas para toque;
* textos legíveis.

---

# 16. ARQUITETURA

Manter a arquitetura simples.

Separar claramente:

### Interface

Responsável por:

* inputs;
* botões;
* cards;
* histórico;
* mensagens.

### Lógica

Responsável por:

* validação;
* cálculo;
* classificação;
* transformação dos dados.

### Persistência

Responsável por:

* salvar histórico;
* recuperar histórico;
* excluir registros.

Evitar código duplicado.

Criar funções pequenas, reutilizáveis e fáceis de testar.

---

# 17. PRINCÍPIO LOW-CODE

Adotar uma filosofia de desenvolvimento **low-code orientada à simplicidade**.

Não adicionar bibliotecas ou frameworks sem necessidade.

Priorizar:

* componentes reutilizáveis;
* lógica simples;
* baixo acoplamento;
* fácil manutenção;
* facilidade de entendimento por estudantes;
* rápida evolução do projeto.

Qualquer dependência externa deve ter uma justificativa clara.

---

# 18. EXPERIÊNCIA DE PRIMEIRO USO

Quando o usuário abrir o sistema pela primeira vez, a interface deve ser autoexplicativa.

Pode apresentar uma pequena indicação:

**Como funciona?**

A1 vale 30 pontos.
A2 vale 30 pontos.
A3 vale 40 pontos.

**Informe suas notas e descubra sua equivalência de 0 a 100.**

Não criar tutorial longo.

---

# 19. CASO DE EXEMPLO

Utilizar como exemplo de teste:

```text
A1 = 21
A2 = 24
A3 = 32
```

Resultado esperado:

```text
A1 = 70%
A2 = 80%
A3 = 80%

Nota final = 77/100
Percentual = 77%
```

Outro teste:

```text
A1 = 30
A2 = 30
A3 = 40
```

Resultado:

```text
100/100
100%
```

Teste mínimo:

```text
A1 = 0
A2 = 0
A3 = 0
```

Resultado:

```text
0/100
0%
```

---

# 20. TESTES

Antes de considerar o projeto concluído, testar:

* valores mínimos;
* valores máximos;
* campos vazios;
* números negativos;
* valores acima do limite;
* valores decimais, caso sejam permitidos;
* histórico;
* exclusão de registros;
* limpeza do histórico;
* atualização da página;
* utilização em celular;
* navegação por teclado.

Criar testes para garantir que a fórmula permaneça correta durante futuras alterações.

---

# 21. MELHORIAS FUTURAS

Estruturar o código para permitir posteriormente:

* diferentes modelos de avaliação;
* pesos configuráveis;
* outras disciplinas;
* cálculo de nota necessária para atingir determinado resultado;
* simulação de notas;
* comparação entre cenários;
* exportação do histórico;
* geração de relatório;
* instalação como PWA;
* modo escuro.

Essas funcionalidades **não devem ser implementadas agora** caso aumentem desnecessariamente a complexidade da primeira versão.

---

# 22. DIRETRIZ FINAL DE UX

A aplicação deve transmitir a sensação de:

**"Eu coloco minhas notas e imediatamente entendo meu resultado."**

Não transformar uma operação matemática simples em uma aplicação complicada.

O usuário deve conseguir realizar seu primeiro cálculo em poucos segundos.

Priorize:

**clareza > quantidade de funcionalidades**

**UX > complexidade técnica**

**simplicidade > excesso de componentes**

**feedback imediato > navegação desnecessária**

---

# 23. ENTREGA

Antes de implementar, analise os requisitos e proponha uma estrutura de arquivos adequada.

Depois:

1. criar a interface;
2. implementar a lógica de cálculo;
3. implementar validações;
4. implementar histórico com localStorage;
5. implementar responsividade;
6. implementar acessibilidade;
7. testar os casos fornecidos;
8. revisar a UX;
9. corrigir problemas;
10. entregar uma versão funcional.

Não apenas gere código.

**Pense como um engenheiro de produto:** questione decisões que prejudiquem a experiência do usuário, mantenha a solução simples e explique brevemente as decisões arquiteturais importantes.
