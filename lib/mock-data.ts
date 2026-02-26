export interface CarListing {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fairPrice: number
  listedDate: string
  condition: "Excellent" | "Good" | "Fair" | "Poor"
  transmission: "Automatic" | "Manual"
  fuelType: "Gasoline" | "Diesel" | "Hybrid" | "Electric"
  bodyType: string
  dealRating: "Great Deal" | "Good Deal" | "Fair Deal" | "Overpriced"
}

export interface PriceTrendPoint {
  month: string
  avgPrice: number
  listings: number
  medianPrice: number
}

export interface BrandDistribution {
  name: string
  count: number
  avgPrice: number
}

export interface MileagePricePoint {
  mileage: number
  price: number
  make: string
}

export interface BodyTypeData {
  type: string
  count: number
  avgPrice: number
  pctChange: number
}

export interface YearDistribution {
  year: string
  count: number
}

// Mock data for car listings from ecaytrade.com
export const carListings: CarListing[] = [
  { id: "1", make: "Toyota", model: "Camry", year: 2022, price: 28500, mileage: 15000, fairPrice: 27000, listedDate: "2026-02-10", condition: "Excellent", transmission: "Automatic", fuelType: "Gasoline", bodyType: "Sedan", dealRating: "Fair Deal" },
  { id: "2", make: "Honda", model: "CR-V", year: 2021, price: 31200, mileage: 22000, fairPrice: 32500, listedDate: "2026-02-08", condition: "Good", transmission: "Automatic", fuelType: "Gasoline", bodyType: "SUV", dealRating: "Great Deal" },
  { id: "3", make: "Toyota", model: "Tacoma", year: 2020, price: 35800, mileage: 30000, fairPrice: 34000, listedDate: "2026-02-12", condition: "Good", transmission: "Automatic", fuelType: "Gasoline", bodyType: "Truck", dealRating: "Overpriced" },
  { id: "4", make: "BMW", model: "X3", year: 2021, price: 42000, mileage: 18000, fairPrice: 41500, listedDate: "2026-02-05", condition: "Excellent", transmission: "Automatic", fuelType: "Gasoline", bodyType: "SUV", dealRating: "Fair Deal" },
  { id: "5", make: "Honda", model: "Civic", year: 2023, price: 24500, mileage: 8000, fairPrice: 25000, listedDate: "2026-02-14", condition: "Excellent", transmission: "Automatic", fuelType: "Gasoline", bodyType: "Sedan", dealRating: "Great Deal" },
  { id: "6", make: "Ford", model: "F-150", year: 2019, price: 38000, mileage: 45000, fairPrice: 36000, listedDate: "2026-01-28", condition: "Good", transmission: "Automatic", fuelType: "Gasoline", bodyType: "Truck", dealRating: "Overpriced" },
  { id: "7", make: "Mercedes", model: "C-Class", year: 2022, price: 45000, mileage: 12000, fairPrice: 44000, listedDate: "2026-02-01", condition: "Excellent", transmission: "Automatic", fuelType: "Gasoline", bodyType: "Sedan", dealRating: "Fair Deal" },
  { id: "8", make: "Toyota", model: "RAV4", year: 2021, price: 29800, mileage: 25000, fairPrice: 30500, listedDate: "2026-02-11", condition: "Good", transmission: "Automatic", fuelType: "Hybrid", bodyType: "SUV", dealRating: "Great Deal" },
  { id: "9", make: "Nissan", model: "Altima", year: 2020, price: 19500, mileage: 35000, fairPrice: 20000, listedDate: "2026-01-20", condition: "Fair", transmission: "Automatic", fuelType: "Gasoline", bodyType: "Sedan", dealRating: "Great Deal" },
  { id: "10", make: "Jeep", model: "Wrangler", year: 2022, price: 48000, mileage: 10000, fairPrice: 46500, listedDate: "2026-02-15", condition: "Excellent", transmission: "Automatic", fuelType: "Gasoline", bodyType: "SUV", dealRating: "Fair Deal" },
  { id: "11", make: "Hyundai", model: "Tucson", year: 2023, price: 27500, mileage: 5000, fairPrice: 28000, listedDate: "2026-02-13", condition: "Excellent", transmission: "Automatic", fuelType: "Hybrid", bodyType: "SUV", dealRating: "Great Deal" },
  { id: "12", make: "Chevrolet", model: "Silverado", year: 2020, price: 36500, mileage: 40000, fairPrice: 35000, listedDate: "2026-01-15", condition: "Good", transmission: "Automatic", fuelType: "Gasoline", bodyType: "Truck", dealRating: "Fair Deal" },
  { id: "13", make: "Audi", model: "Q5", year: 2021, price: 40500, mileage: 20000, fairPrice: 41000, listedDate: "2026-02-07", condition: "Good", transmission: "Automatic", fuelType: "Gasoline", bodyType: "SUV", dealRating: "Great Deal" },
  { id: "14", make: "Toyota", model: "Corolla", year: 2023, price: 21000, mileage: 6000, fairPrice: 21500, listedDate: "2026-02-16", condition: "Excellent", transmission: "Automatic", fuelType: "Gasoline", bodyType: "Sedan", dealRating: "Great Deal" },
  { id: "15", make: "Honda", model: "Accord", year: 2022, price: 29000, mileage: 14000, fairPrice: 28500, listedDate: "2026-02-09", condition: "Excellent", transmission: "Automatic", fuelType: "Gasoline", bodyType: "Sedan", dealRating: "Fair Deal" },
  { id: "16", make: "Ford", model: "Explorer", year: 2021, price: 37500, mileage: 28000, fairPrice: 38000, listedDate: "2026-01-25", condition: "Good", transmission: "Automatic", fuelType: "Gasoline", bodyType: "SUV", dealRating: "Great Deal" },
  { id: "17", make: "Lexus", model: "RX 350", year: 2022, price: 52000, mileage: 11000, fairPrice: 51000, listedDate: "2026-02-04", condition: "Excellent", transmission: "Automatic", fuelType: "Gasoline", bodyType: "SUV", dealRating: "Fair Deal" },
  { id: "18", make: "Kia", model: "Sportage", year: 2023, price: 26000, mileage: 7000, fairPrice: 26500, listedDate: "2026-02-17", condition: "Excellent", transmission: "Automatic", fuelType: "Hybrid", bodyType: "SUV", dealRating: "Great Deal" },
  { id: "19", make: "Nissan", model: "Rogue", year: 2021, price: 26500, mileage: 24000, fairPrice: 27000, listedDate: "2026-02-06", condition: "Good", transmission: "Automatic", fuelType: "Gasoline", bodyType: "SUV", dealRating: "Great Deal" },
  { id: "20", make: "Toyota", model: "4Runner", year: 2020, price: 42000, mileage: 35000, fairPrice: 40000, listedDate: "2026-01-30", condition: "Good", transmission: "Automatic", fuelType: "Gasoline", bodyType: "SUV", dealRating: "Overpriced" },
  { id: "21", make: "Volkswagen", model: "Tiguan", year: 2022, price: 28000, mileage: 16000, fairPrice: 28500, listedDate: "2026-02-03", condition: "Good", transmission: "Automatic", fuelType: "Gasoline", bodyType: "SUV", dealRating: "Great Deal" },
  { id: "22", make: "Subaru", model: "Outback", year: 2022, price: 30000, mileage: 19000, fairPrice: 30500, listedDate: "2026-02-02", condition: "Good", transmission: "Automatic", fuelType: "Gasoline", bodyType: "SUV", dealRating: "Great Deal" },
  { id: "23", make: "Mazda", model: "CX-5", year: 2023, price: 29500, mileage: 4000, fairPrice: 30000, listedDate: "2026-02-18", condition: "Excellent", transmission: "Automatic", fuelType: "Gasoline", bodyType: "SUV", dealRating: "Great Deal" },
  { id: "24", make: "BMW", model: "3 Series", year: 2021, price: 38000, mileage: 21000, fairPrice: 37000, listedDate: "2026-01-22", condition: "Good", transmission: "Automatic", fuelType: "Gasoline", bodyType: "Sedan", dealRating: "Fair Deal" },
]

export const priceTrends: PriceTrendPoint[] = [
  { month: "Sep", avgPrice: 33200, listings: 145, medianPrice: 30500 },
  { month: "Oct", avgPrice: 33800, listings: 162, medianPrice: 31000 },
  { month: "Nov", avgPrice: 32900, listings: 138, medianPrice: 30200 },
  { month: "Dec", avgPrice: 32100, listings: 120, medianPrice: 29800 },
  { month: "Jan", avgPrice: 33500, listings: 175, medianPrice: 31200 },
  { month: "Feb", avgPrice: 34100, listings: 189, medianPrice: 31800 },
]

export const brandDistribution: BrandDistribution[] = [
  { name: "Toyota", count: 85, avgPrice: 32400 },
  { name: "Honda", count: 62, avgPrice: 28200 },
  { name: "Ford", count: 48, avgPrice: 35600 },
  { name: "BMW", count: 35, avgPrice: 42100 },
  { name: "Nissan", count: 30, avgPrice: 24300 },
  { name: "Hyundai", count: 28, avgPrice: 25800 },
  { name: "Jeep", count: 25, avgPrice: 39500 },
  { name: "Mercedes", count: 22, avgPrice: 48700 },
]

export const mileagePriceData: MileagePricePoint[] = [
  { mileage: 5000, price: 27500, make: "Hyundai" },
  { mileage: 4000, price: 29500, make: "Mazda" },
  { mileage: 6000, price: 21000, make: "Toyota" },
  { mileage: 7000, price: 26000, make: "Kia" },
  { mileage: 8000, price: 24500, make: "Honda" },
  { mileage: 10000, price: 48000, make: "Jeep" },
  { mileage: 11000, price: 52000, make: "Lexus" },
  { mileage: 12000, price: 45000, make: "Mercedes" },
  { mileage: 14000, price: 29000, make: "Honda" },
  { mileage: 15000, price: 28500, make: "Toyota" },
  { mileage: 16000, price: 28000, make: "Volkswagen" },
  { mileage: 18000, price: 42000, make: "BMW" },
  { mileage: 19000, price: 30000, make: "Subaru" },
  { mileage: 20000, price: 40500, make: "Audi" },
  { mileage: 21000, price: 38000, make: "BMW" },
  { mileage: 22000, price: 31200, make: "Honda" },
  { mileage: 24000, price: 26500, make: "Nissan" },
  { mileage: 25000, price: 29800, make: "Toyota" },
  { mileage: 28000, price: 37500, make: "Ford" },
  { mileage: 30000, price: 35800, make: "Toyota" },
  { mileage: 35000, price: 19500, make: "Nissan" },
  { mileage: 35000, price: 42000, make: "Toyota" },
  { mileage: 40000, price: 36500, make: "Chevrolet" },
  { mileage: 45000, price: 38000, make: "Ford" },
]

export const bodyTypeData: BodyTypeData[] = [
  { type: "SUV", count: 125, avgPrice: 34800, pctChange: 5.2 },
  { type: "Sedan", count: 98, avgPrice: 28400, pctChange: -1.8 },
  { type: "Truck", count: 52, avgPrice: 37200, pctChange: 3.4 },
  { type: "Coupe", count: 18, avgPrice: 41500, pctChange: 2.1 },
  { type: "Hatchback", count: 14, avgPrice: 22800, pctChange: -0.5 },
]

export const yearDistribution: YearDistribution[] = [
  { year: "2018", count: 15 },
  { year: "2019", count: 28 },
  { year: "2020", count: 52 },
  { year: "2021", count: 78 },
  { year: "2022", count: 95 },
  { year: "2023", count: 68 },
  { year: "2024", count: 22 },
]

// KPI stats
export const kpiStats = {
  totalListings: 358,
  avgPrice: 33450,
  avgPriceChange: 2.8,
  medianPrice: 31200,
  medianPriceChange: 1.5,
  avgMileage: 21500,
  avgMileageChange: -3.2,
  newListingsThisWeek: 47,
  newListingsChange: 12.5,
  greatDeals: 42,
  greatDealsChange: 8.3,
}
