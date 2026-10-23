export interface SalesRecord {
  Row_ID: number;
  Order_ID: string;
  Order_Date: string;
  Ship_Date: string;
  Ship_Mode: string;
  Customer_ID: string;
  Customer_Name: string;
  Segment: string;
  Country: string;
  City: string;
  State: string;
  Postal_Code: string;
  Region: string;
  Product_ID: string;
  Category: string;
  Sub_Category: string;
  Product_Name: string;
  Sales: number;
  Quantity: number;
  Discount: number;
  Profit: number;
}

export interface KPIOverview {
  totalRevenue: number;
  totalProfit: number;
  profitMarginPct: number;
  totalOrders: number;
  totalLineItems: number;
  totalQuantity: number;
  averageOrderValue: number;
  avgDiscountPct: number;
  revenueMoMGrowthPct: number | null;
}

export interface MonthlyTrendPoint {
  yearMonth: string;
  year: number;
  month: number;
  monthName: string;
  revenue: number;
  profit: number;
  orders: number;
  quantity: number;
  momGrowthPct: number | null;
}

export interface SubCategoryMetric {
  category: string;
  subCategory: string;
  sales: number;
  profit: number;
  marginPct: number;
  quantity: number;
  orders: number;
  avgDiscount: number;
}

export interface RegionalMetric {
  region: string;
  sales: number;
  profit: number;
  marginPct: number;
  orders: number;
  aov: number;
}
