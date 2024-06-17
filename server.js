let erru = 0;
// caregando blibiotecas . . .
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { hasChildren } = require('domhandler');
// const timeout = require('connect-timeout');
// const TIMEOUT = 300000;
const app = express();

// definindo porta
const port = 3000;

// configuracao de tame da selicitacao das urls
const config = {
  timeout: 3000
};

// app.use(timeout(TIMEOUT));

// app.use((req, res, next) => {
//   if(!req.timedout) next();
// });

// definindo o camiho da api
app.get('/u', async (req, res) => {
  const url = req.query.u;
  if (!url) {
    return res.status(400).send('A URL é necessária como parâmetro.');
  }

// fun pager Hrml das paginas
const getHtmt = async (url)=>{
  try{
    const response = await axios.get(url,config);
    return response.data;
  }catch(erro){
    errus();
    console.log('Errou na pagina da Url')
    return '';
  }
};

const errus = ()=>{
  erru++;
}

// urls rc
const RedeURL = ()=>{
  const urls  = ['https://redecanais.mov','https://redecanais.la','https://redecanais.dev','https://redecanais.zip'];
  const numaro = Math.floor(Math.random() * urls.length);
  return urls[numaro];
}

// fun delay
const delay =(ms)=> new Promise(resolve => setTimeout(resolve, ms));

  try {

    // hrml pagina lista de links
    const response = await getHtmt(url);
    const html = response;
    var $ = cheerio.load(html);

    // arry links
    const links = [];

    // const linksJson = [];
    const linksJson = {};


    // pegando links
      $('a').each((index,el)=>{
        const link = (el && $(el).attr('rel') && $(el).attr('rel')=='noopener');
        if (link){
          // console.log(true);
          // RedeURL()+$(el).attr('href')
          links.push(
            'https://'+url.split('/')[2]+$(el).attr('href')
          );
        }
      });

      // pegando links Opicao 02
      if (links.length==0){
        $('div.pm-category-description a').each((index,el)=>{
          const link = $(el).attr('href');
          // console.log( RedeURL()+link);
          // RedeURL()+link
          if (link){
            links.push(
              'https://'+url.split('/')[2]+link
            );
          }
        });
      }
  //    https://redecanais.mov/browse-forever-uma-vida-eterna-videos-1-date.html


    //verificar se todos tem (EP & Temporada nos links);
    /* desativada
   if (links.length>0){
      let index = 0;
      for (const item of links){
        if (item.includes('a-temporada-episodio') || item.includes('a-temporada-legendado-episodio-')){
          // console.log(item);
          console.log(true);
          if (index==links.length-1){
            // setarLisks(true);
          }
        }else {
          // console.log(item);
          console.log(false);
          // setarLisks(false);
          break;
          }
        index++;
      }
    }
      */

    var json = [];
    var linksQueJaTem = '';

    // lisks não então vizios?
    if (links.length>0){

      // verificadores
      var idVerificador = false;
      var id = false
      let index = 0;

      // lop para cada links. . .
       for(item of links){

        // bucando o html da pagina rc
         const htmln = await getHtmt(item);
         const $ = cheerio.load(htmln);

         // aguardar 300 ms para não dau arru nas solisitaçoes
         await delay(300);

         // buscando iflame do player rc
        $('iframe').each((index,item)=>{ 
          const urlIflamer = $(item).attr('name')=='Player';
          if (urlIflamer){
            const playURL = 'https:'+$(item).attr('src');

            // Trabalhado o codigo de virificao
            // console.log((playURL.split('?vid=')[1]));
            var verificador = String(playURL.split('?vid=')[1]).replace(/[^0-9]/g,'');;

            // buscando titulo
            var titulo = $('h1').text().split(' - ');
            if (titulo.length>=4){
                titulo = titulo[3];
            }else if (titulo.length==2){
              titulo = titulo[2];
            }else {
              titulo = titulo[0];
            }

            // verificando se e um teparado !nao filme
            if (!linksQueJaTem.includes(verificador) && verificador!='' && !isNaN(Number(verificador) && verificador.length>=4)){
              id = String(verificador).slice(0,-2);

              // id verividador ja existe
              if (!idVerificador){
                idVerificador = id;
              }

              // vareficar se o id comtinua o mesmo ou não
              if (id && id!=idVerificador){
                linksJson[(Number(id)-2)] = json;
                json = [];
              }

              // add nome e link ou json
              json.push({
                nome: titulo, 
                lisk: playURL
              });

               // impedir repetiçães 
               linksQueJaTem+="**"+verificador+"**";

               // add novo id verificador
               idVerificador = id;
             }
            }else {
              // Iflame não buscado
              // console.log('Não tem');
            }
          });

        // add utimo json
        if (id && json.length>0 && index==links.length -1){
          linksJson[Number(id)-1] = json;
          linksJson[Number(id)] = {errus: erru};
          console.log('Final do json');
         }
        index++;
       }

      }

    // imprimendo json
    res.json(linksJson);
  
  } catch (error) {
    // retornar se uver um erro 
    res.status(500).send(`Erro ao buscar a página: ${error}`);
  }
});

app.listen(port, () => {
  // mostrando onde esta o sevidor, porta/link
  console.log(`Servidor rodando em http://localhost:${port}`);
});