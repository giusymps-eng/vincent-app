import type { MenuItem } from "@/types";

export const TRADIZIONALI: MenuItem[] = [
  { id: "t-pizza-pane", name: "Pizza Pane", description: "Impasto pizza cotto al forno", price: 4.0, category: "tradizionali" },
  { id: "t-bianca", name: "Bianca", description: "Mozzarella, origano e olio", price: 5.0, category: "tradizionali" },
  { id: "t-marinara", name: "Marinara", description: "Pomodoro, aglio, origano e olio", price: 4.5, category: "tradizionali" },
  { id: "t-nutella", name: "Nutella", description: "Nutella, pistacchio e zucchero a velo", price: 7.0, category: "tradizionali" },
  { id: "t-margherita", name: "Margherita", description: "Pomodoro, mozzarella, origano e olio", price: 5.5, category: "tradizionali" },
  { id: "t-diavola", name: "Diavola", description: "Pomodoro, mozzarella, salame piccante, olio piccante, origano", price: 7.0, category: "tradizionali" },
  { id: "t-napoli", name: "Napoli", description: "Pomodoro, mozzarella, acciughe, origano e olio", price: 7.0, category: "tradizionali" },
  { id: "t-funghi", name: "Funghi", description: "Pomodoro, mozzarella, funghi freschi, origano e olio", price: 6.0, category: "tradizionali" },
  { id: "t-boscaiola", name: "Boscaiola", description: "Pomodoro, mozzarella, funghi, salsiccia, origano e olio", price: 8.0, category: "tradizionali" },
  { id: "t-pub", name: "Pub", description: "Pomodoro, mozzarella, wurstel, patatine*, origano e olio", price: 7.0, category: "tradizionali" },
  { id: "t-genovese", name: "Genovese", description: "Pomodoro, mozzarella, pesto e olio", price: 7.0, category: "tradizionali" },
  { id: "t-capricciosa", name: "Capricciosa", description: "Pomodoro, mozzarella, prosciutto cotto, funghi, uovo, origano e olio", price: 7.5, category: "tradizionali" },
  { id: "t-tonnocipolla", name: "Tonno e Cipolla", description: "Pomodoro, mozzarella, tonno, cipolla, origano e olio", price: 8.0, category: "tradizionali" },
  { id: "t-quattroformaggi", name: "Quattro Formaggi", description: "Mozzarella, emmental, gorgonzola, grana, origano e olio", price: 8.0, category: "tradizionali" },
  { id: "t-ortolana", name: "Ortolana", description: "Pomodoro, mozzarella, melanzane, zucchine, peperoni, origano e olio", price: 8.0, category: "tradizionali" },
  { id: "t-spinacina", name: "Spinacina", description: "Pomodoro, mozzarella, spinaci*, uovo, grana, origano e olio", price: 8.5, category: "tradizionali" },
  { id: "t-peperoni", name: "Peperoni", description: "Mozzarella, salsiccia, cipolla, peperoni, origano e olio", price: 8.0, category: "tradizionali" },
  { id: "t-norma", name: "Norma", description: "Pomodoro, mozzarella, melanzane, grana o ricotta salata, origano e olio", price: 8.0, category: "tradizionali" },
  { id: "t-parmigiana", name: "Parmigiana", description: "Pomodoro, mozzarella, melanzane, prosciutto cotto, uovo, grana, origano e olio", price: 9.0, category: "tradizionali" },
  { id: "t-porcina", name: "Porcina", description: "Pomodoro, mozzarella, funghi porcini, origano e olio", price: 8.0, category: "tradizionali" },
  { id: "t-crudo", name: "Crudo", description: "Pomodoro, mozzarella, prosciutto crudo, origano e olio", price: 8.0, category: "tradizionali" },
  { id: "t-prosciuttofunghi", name: "Prosciutto e Funghi", description: "Pomodoro, mozzarella, prosciutto cotto, funghi, origano e olio", price: 7.0, category: "tradizionali" },
  { id: "t-ungherese", name: "Ungherese", description: "Pomodoro, mozzarella, salame ungherese, origano e olio", price: 8.0, category: "tradizionali" },
  { id: "t-margheritasg", name: "Margherita Senza Glutine", description: "Prodotto precotto surgelato, non manipolato in cucina", price: 8.0, category: "tradizionali", glutenFree: true, frozen: true },
];

export const SPECIALI: MenuItem[] = [
  { id: "s-gns", name: "Gorgo, Noci e Speck", description: "Mozzarella, gorgonzola, noci, speck, origano e olio", price: 9.0, category: "speciali" },
  { id: "s-ruca", name: "Ruca", description: "Pomodoro, mozzarella, bresaola, rucola, scaglie di grana, origano e olio", price: 8.0, category: "speciali" },
  { id: "s-caprese", name: "Caprese", description: "Mozzarella, pachino, bufala, origano e olio", price: 9.0, category: "speciali" },
  { id: "s-calabrese", name: "Calabrese", description: "Pomodoro, mozzarella, nduja, origano e olio", price: 8.5, category: "speciali" },
  { id: "s-bacon", name: "Bacon", description: "Mozzarella, funghi, bacon, scaglie di grana", price: 9.0, category: "speciali" },
  { id: "s-capricciosaplus", name: "Capricciosa Plus", description: "Pomodoro, mozzarella, prosciutto cotto, carciofi, uovo, funghi, olive, origano e olio", price: 9.0, category: "speciali" },
  { id: "s-porchetta", name: "Porchetta", description: "Mozzarella, porchetta, rucola, grana, origano e olio", price: 8.0, category: "speciali" },
  { id: "s-rosalba", name: "Rosalba", description: "Mozzarella, cipolla agro dolce, grana, origano e olio", price: 7.0, category: "speciali" },
  { id: "s-venere", name: "Venere", description: "Pomodoro, mozzarella di bufala, salsiccia, funghi porcini, cipolla, olive, origano e olio", price: 12.0, category: "speciali" },
  { id: "s-friarielli", name: "Ai Friarielli", description: "Pomodoro, mozzarella, friarielli, salsiccia, gorgonzola, grana, origano e olio", price: 11.0, category: "speciali" },
  { id: "s-fruttidimare", name: "Frutti di Mare", description: "Pomodoro, mozzarella, frutti di mare*, aromi vari", price: 12.0, category: "speciali", frozen: true },
  { id: "s-sfiziosa", name: "Sfiziosa", description: "Mozzarella, olive, pomodori secchi, salame piccante, grana, origano e olio", price: 10.0, category: "speciali" },
  { id: "s-friarsalmone", name: "Friarielli e Salmone", description: "Bufala, friarielli, salmone", price: 12.0, category: "speciali" },
  { id: "s-carbonara", name: "Carbonara", description: "Mozzarella, pecorino romano, guanciale, uovo, pepe nero, cipolla caramellata agrodolce, origano e olio", price: 12.0, category: "speciali" },
  { id: "s-fantasiaformaggi", name: "Fantasia di Formaggi", description: "Mozzarella, gorgonzola, provola affumicata, grana padano, panure aromatizzata, guanciale, glassa di aceto balsamico", price: 13.0, category: "speciali" },
  { id: "s-mortazza", name: "Mortazza", description: "Mozzarella, stracchino, mortadella, granella di pistacchio", price: 10.0, category: "speciali" },
  { id: "s-crudostracchino", name: "Crudo e Stracchino", description: "Mozzarella, crudo, stracchino e noci", price: 9.0, category: "speciali" },
  { id: "s-pannapistacchio", name: "Panna e Pistacchio", description: "Mozzarella, panna, pistacchio e speck", price: 10.0, category: "speciali" },
  { id: "s-montesana", name: "Montesana", description: "Pomodoro, gorgonzola, funghi porcini, speck, origano e olio", price: 11.0, category: "speciali" },
  { id: "s-cipollacapperi", name: "Cipolla e Capperi", description: "Pomodoro, pomodorini, cipolla agrodolce, capperi, olive nere, glassa di aceto balsamico", price: 9.0, category: "speciali" },
];

export const DICASA: MenuItem[] = [
  { id: "d-giorgia", name: "Giorgia", description: "Mozzarella, carciofi*, prosciutto crudo, grana, origano e olio", price: 10.0, category: "dicasa" },
  { id: "d-gaia", name: "Gaia", description: "Ragù, panna, mozzarella, uovo, grana, origano e olio", price: 10.0, category: "dicasa" },
  { id: "d-margheritadoc", name: "Margherita DOC", description: "Pomodoro, mozzarella di bufala, origano e olio", price: 8.0, category: "dicasa" },
  { id: "d-sofia", name: "Sofia", description: "Pomodoro, mozzarella, gamberetti, zucchine, origano e olio", price: 11.0, category: "dicasa" },
  { id: "d-vito", name: "Vito", description: "Pomodoro, mozzarella, zucchine, salsiccia, panna", price: 9.0, category: "dicasa" },
  { id: "d-vincent", name: "Vincent", description: "Pomodoro, mozzarella, radicchio, gorgonzola e provola", price: 10.0, category: "dicasa" },
  { id: "d-alice", name: "Alice", description: "Mozzarella, panna, pistacchio, crema di porcini, salsiccia", price: 12.0, category: "dicasa" },
  { id: "d-mattia", name: "Mattia", description: "Pomodoro, mozzarella, finocchietto selvatico, pinoli, acciughe, uvetta, panure aromatizzata", price: 11.0, category: "dicasa" },
];

export const FOCACCIA_CALZONE: MenuItem[] = [
  { id: "fc-focaccia", name: "Focaccia", description: "Mozzarella, funghi porcini, pomodoro di bruschetta, grana", price: 9.0, category: "focaccia_calzone" },
  { id: "fc-focacciacomevuoi", name: "Focaccia Come Vuoi Tu", description: "Componi la tua focaccia", price: 9.0, category: "focaccia_calzone" },
  { id: "fc-calzone", name: "Calzone", description: "Pomodoro, mozzarella, prosciutto cotto, uovo, funghi, origano e olio", price: 8.0, category: "focaccia_calzone" },
];

export const PANINI: MenuItem[] = [
  {
    id: "panino-personalizzato",
    name: "Panino personalizzato",
    description: "Scrivi tu come lo vuoi",
    price: 1.0,
    category: "panini",
  },

  { id: "p-hotdog", name: "Hot Dog", description: "Wurstel, patate*, maionese, ketchup", price: 3.5, category: "panini" },
  { id: "p-sofisticato", name: "Sofisticato", description: "Wurstel, mozzarella, salsa rosa", price: 3.5, category: "panini" },
  { id: "p-gustoso", name: "Gustoso", description: "Prosciutto cotto, senape, maionese, groviera, pomodoro, cipolla", price: 5.0, category: "panini" },
  { id: "p-fulmine", name: "Fulmine", description: "Prosciutto cotto, patè di olive, insalata russa, lattuga", price: 5.0, category: "panini" },
  { id: "p-sfizioso", name: "Sfizioso", description: "Salame piccante, tabasco, pomodori secchi, cipolla", price: 5.0, category: "panini" },
  { id: "p-picasso", name: "Picasso", description: "Salame, gorgonzola, mozzarella, cipolla, tabasco", price: 5.0, category: "panini" },
  { id: "p-montanaro", name: "Montanaro", description: "Salsiccia, maionese, tonno, cipolla", price: 6.0, category: "panini" },
  { id: "p-lucignolo", name: "Lucignolo", description: "Salsiccia, philadelphia, funghi, tabasco", price: 6.0, category: "panini" },
  { id: "p-vegetariano", name: "Vegetariano", description: "Pomodoro, mozzarella, lattuga, origano", price: 4.0, category: "panini" },
  { id: "p-cremoso", name: "Cremoso", description: "Prosciutto cotto, crema di funghi, philadelphia", price: 4.5, category: "panini" },
  { id: "p-palmito", name: "Palmito", description: "Prosciutto cotto, insalata russa, lattuga", price: 4.5, category: "panini" },
  { id: "p-falcito", name: "Falcito", description: "Prosciutto cotto, melanzane, maionese, pomodoro, lattuga, cipolla", price: 6.0, category: "panini" },
  { id: "p-porchettone", name: "Porchettone", description: "Mozzarella, porchetta, parmigiano", price: 5.0, category: "panini" },
  { id: "p-specialblue", name: "Special Blue", description: "Cordon Bleu, mozzarella, pomodoro, lattuga", price: 5.5, category: "panini" },
  { id: "p-superburger", name: "Super Burger", description: "Hamburger, bacon, pomodoro, lattuga", price: 6.0, category: "panini" },
];


export const PANINAZZI: MenuItem[] = [
  { id: "pz-manzo-classico", name: "Manzo N.1", description: "Carne di manzo siciliano (220g), pomodoro, insalata, olio extra vergine d'oliva, provola delle Madonie, ketchup e maionese", price: 8.0, category: "paninazzi" },
  { id: "pz-manzo-bbq", name: "Manzo N.2", description: "Carne di manzo siciliano (220g), insalata, cipolla in agrodolce, pomodoro, provola delle Madonie, guanciale croccante, salsa barbecue, ketchup e maionese", price: 9.0, category: "paninazzi" },
  { id: "pz-asino", name: "Manzo N.3", description: "Carne di asino di Chiaramonte Gulfi (220g), pomodoro, insalata mista, mozzarella di bufala, funghi saltati in padella, cipolla in agrodolce, salsa barbecue, maionese, pepe", price: 10.0, category: "paninazzi" },
  { id: "pz-suino-nero", name: "Manzo N.4", description: "Carne di suino nero (220g), pomodorino confit, cavolo verza, mozzarella di bufala, cipolla cruda, ketchup e maionese", price: 10.0, category: "paninazzi" },
];

export const STUZZICHERIE: MenuItem[] = [
  { id: "st-antipasto", name: "Antipasto Rustico Misto", price: 10.0, category: "stuzzicherie" },
  { id: "st-mozzarelline", name: "Mozzarelline*", price: 3.5, category: "stuzzicherie", frozen: true },
  { id: "st-crocchette", name: "Crocchette di Patate*", price: 3.5, category: "stuzzicherie", frozen: true },
  { id: "st-patatine", name: "Patatine Fritte*", price: 2.5, category: "stuzzicherie", frozen: true },
];

export const PIATTI_UNICI: MenuItem[] = [
  { id: "pu-hamburger", name: "Hamburger 150g", description: "Insalata russa, pomodori secchi, bufala", price: 9.0, category: "piattiunici" },
  { id: "pu-cordonblue", name: "Cordon Blue", description: "Crocchette, patatine*", price: 8.0, category: "piattiunici" },
];

export const BRUSCHETTE: MenuItem[] = [
  { id: "br-classica", name: "Bruschetta Classica", description: "Pomodoro a pezzi, cipolla, origano e olio", price: 4.0, category: "bruschette" },
  { id: "br-olive", name: "Bruschetta alle Olive", description: "Pomodoro a pezzi, olive, cipolla, origano e olio", price: 4.5, category: "bruschette" },
  { id: "br-tirolese", name: "Bruschetta Tirolese", description: "Pomodoro a pezzi, speck, gorgonzola, cipolla, origano e olio", price: 5.0, category: "bruschette" },
  { id: "br-funghi", name: "Bruschetta ai Funghi", description: "Pomodoro a pezzi, mozzarella, funghetti, cipolla, origano e olio", price: 5.0, category: "bruschette" },
];

export const CONTORNI: MenuItem[] = [
  { id: "c-patatine", name: "Patatine Fritte", price: 2.5, category: "contorni", frozen: true },
  { id: "c-mozzarelline", name: "Mozzarelline", price: 3.5, category: "contorni", frozen: true },
  { id: "c-crocchette", name: "Crocchette di Patate", price: 3.5, category: "contorni", frozen: true },
];

export const BEVANDE: MenuItem[] = [
  { id: "b-acqua50", name: "Acqua N/F 50cl", price: 1.0, category: "bevande" },
  { id: "b-acqua100", name: "Acqua N/F 100cl", price: 2.0, category: "bevande" },
  { id: "b-cocacola", name: "Coca Cola 33cl", price: 2.0, category: "bevande" },
{ id: "b-cocacola-zero", name: "Coca Cola Zero 33cl", price: 2.0, category: "bevande" },
{ id: "b-sprite", name: "Sprite 33cl", price: 2.0, category: "bevande" },
{ id: "b-fanta", name: "Fanta 33cl", price: 2.0, category: "bevande" },

{ id: "b-the-limone", name: "Thè al Limone 33cl", price: 2.5, category: "bevande" },
{ id: "b-the-pesca", name: "Thè alla Pesca 33cl", price: 2.5, category: "bevande" },

];

export const BIRRE: MenuItem[] = [
  { id: "bi-moretti", name: "Moretti 33cl", price: 1.5, category: "birre" },
  { id: "bi-tuborg", name: "Tuborg 33cl", price: 2.0, category: "birre" },
  { id: "bi-heineken", name: "Heineken 33cl", price: 2.5, category: "birre" },
  { id: "bi-ceres", name: "Ceres 33cl", price: 3.5, category: "birre" },
  { id: "bi-becks", name: "Beck's 33cl", price: 2.0, category: "birre" },
  { id: "bi-corona", name: "Corona 33cl", price: 3.0, category: "birre" },
  { id: "bi-paulaner", name: "Paulaner 50cl", price: 4.0, category: "birre" },
  { id: "bi-peronisg", name: "Peroni Senza Glutine 33cl", price: 3.0, category: "birre", glutenFree: true },
];

export const AGGIUNTE_PIZZA = [
  { name: "Bresaola", price: 1.5 },
  { name: "Crudo", price: 1.5 },
  { name: "Speck", price: 1.5 },
  { name: "Rucola", price: 1.5 },
  { name: "Bufala", price: 1.5 },
  { name: "Friarielli", price: 1.5 },
  { name: "Porchetta", price: 1.5 },
  { name: "Salsiccia", price: 1.5 },
  { name: "Tonno", price: 1.5 },
  { name: "Pomodori Secchi", price: 1.5 },
  { name: "Carciofi*", price: 1.5 },
  { name: "Mozzarella senza lattosio", price: 1.5 },
];

export const PIZZA_CATEGORIES = ["tradizionali", "speciali", "dicasa", "focaccia_calzone"] as const;

export const ALL_MENU = {
  tradizionali: TRADIZIONALI,
  speciali: SPECIALI,
  dicasa: DICASA,
  focaccia_calzone: FOCACCIA_CALZONE,
  panini: PANINI,
  paninazzi: PANINAZZI,
  stuzzicherie: STUZZICHERIE,
  piattiunici: PIATTI_UNICI,
  bruschette: BRUSCHETTE,
  contorni: CONTORNI,
  bevande: BEVANDE,
  birre: BIRRE,
};

export const CATEGORY_LABELS: Record<string, string> = {
  tradizionali: "Le Tradizionali",
  speciali: "Le Speciali",
  dicasa: "Di Casa",
  focaccia_calzone: "Focaccia e Calzone",
  panini: "Panini",
  paninazzi: "Paninazzi",
  stuzzicherie: "Stuzzicherie",
  piattiunici: "Piatti Unici",
  bruschette: "Bruschette",
  contorni: "Contorni",
  bevande: "Bevande",
  birre: "Birre",
};

export const COPERTO = 1.0;
export const DELIVERY_FEE_PER_PIZZA = 0.5;
export const DELIVERY_FEE_FIXED_THRESHOLD = 6;
export const DELIVERY_FEE_FIXED = 3.0;
export const SUPPLEMENTO_PANINO = 0.5;

export function getAllPizzas(): MenuItem[] {
  return [...TRADIZIONALI, ...SPECIALI, ...DICASA, ...FOCACCIA_CALZONE];
}
