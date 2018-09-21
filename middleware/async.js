module.exports = function(handler){     //to jest factory function
    return async (req, res, next) => {  //to nie moze byc zwykla funkcja
        try{                            //bo w expressie tylko przekazujemy referencje
            await handler(req, res);    //a sam framework decyduje, kiedy ja wywolac
        }                               //factory function nie musi byc async, bo
        catch(ex){                      //niczego nie awaitujemy
            next(ex);
        }
    }
}