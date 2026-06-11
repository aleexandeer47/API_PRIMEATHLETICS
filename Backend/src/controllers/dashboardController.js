import orderModel from "../models/order.js";
import productModel from "../models/product.js";
import cartModel from "../models/cart.js";
import adminModel from "../models/admin.js";
import employeeModel from "../models/employee.js";

const getWeekBoundaries = (date = new Date()) => {
  const current = new Date(date);
  const day = current.getDay();
  // Adjust so Monday is 1, Sunday is 7 (in JS getDay(): 0 is Sunday, 1 is Monday, etc.)
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(current.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

const formatPercentageChange = (current, previous, suffix = "que la semana pasada", allowNegativeTrend = true) => {
  if (!previous) {
    if (current > 0) return { change: `+100% ${suffix}`, trend: "up" };
    return { change: `0% ${suffix}`, trend: "neutral" };
  }
  const diff = ((current - previous) / previous) * 100;
  const absDiff = Math.abs(diff).toFixed(2);

  if (diff < 0 && !allowNegativeTrend) {
    return {
      change: `${absDiff}% de cambio ${suffix}`,
      trend: "neutral",
    };
  }

  const trend = diff > 0 ? "up" : diff < 0 ? "down" : "neutral";
  const word = diff > 0 ? "más" : diff < 0 ? "menos" : "igual";
  return {
    change: `${absDiff}% ${word} ${suffix}`,
    trend,
  };
};

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const { startOfWeek: thisWeekStart, endOfWeek: thisWeekEnd } = getWeekBoundaries(now);

    const prevWeekNow = new Date(now);
    prevWeekNow.setDate(now.getDate() - 7);
    const { startOfWeek: prevWeekStart, endOfWeek: prevWeekEnd } = getWeekBoundaries(prevWeekNow);

    // 1. Fetch Orders for current and previous week
    const thisWeekOrders = await orderModel.find({
      ordered_at: { $gte: thisWeekStart, $lte: thisWeekEnd },
    }).lean();

    const prevWeekOrders = await orderModel.find({
      ordered_at: { $gte: prevWeekStart, $lte: prevWeekEnd },
    }).lean();

    // 1.1 Card 1: Ventas de la semana (Sum of total_amount, negative indicators disabled)
    const thisWeekSales = thisWeekOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const prevWeekSales = prevWeekOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const salesCardChange = formatPercentageChange(thisWeekSales, prevWeekSales, "que la semana pasada", false);

    // 1.2 Card 2: Ingresos de la semana (Paid orders only, negative indicators disabled)
    const thisWeekIncome = thisWeekOrders
      .filter((o) => o.payment_status === true)
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const prevWeekIncome = prevWeekOrders
      .filter((o) => o.payment_status === true)
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const incomeCardChange = formatPercentageChange(thisWeekIncome, prevWeekIncome, "que la semana pasada", false);

    // 2. Card 3: Inventario (Sum of stock of active products: active field is not explicitly false)
    const activeProducts = await productModel.find({ active: { $ne: false } }).lean();
    let totalInventoryStock = 0;
    for (const prod of activeProducts) {
      for (const variant of prod.variants || []) {
        for (const sizeInfo of variant.sizes || []) {
          totalInventoryStock += Number(sizeInfo.stock || 0);
        }
      }
    }

    // 3. Card 4: Pedidos activos (order_status is false)
    const activeOrdersCount = await orderModel.countDocuments({ order_status: false });

    // 4. Card 5: Usuarios activos (only admins + employees who have status: true)
    const activeAdmins = await adminModel.countDocuments({ status: true });
    const activeEmployees = await employeeModel.countDocuments({ status: true });
    const totalActiveUsers = activeAdmins + activeEmployees;

    // 5. Global Metrics
    const allOrders = await orderModel.find().lean();
    const totalGlobalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const totalOrdersCount = allOrders.length;

    // 6. Top Selling Products (Top 5 based on cart items)
    const allCarts = await cartModel.find().lean();
    const cartMap = {};
    const cartCustomerMap = {};
    for (const c of allCarts) {
      const cartIdStr = c._id.toString();
      cartMap[cartIdStr] = c.items || [];
      if (c.customer_id) {
        cartCustomerMap[cartIdStr] = c.customer_id.toString();
      }
    }

    const productQuantities = {};
    for (const order of allOrders) {
      const items = cartMap[order.shopping_cart_id?.toString()] || [];
      for (const item of items) {
        if (item.product_id) {
          const prodId = item.product_id.toString();
          productQuantities[prodId] = (productQuantities[prodId] || 0) + Number(item.quantity || 0);
        }
      }
    }

    const sortedProducts = Object.entries(productQuantities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topProducts = [];
    for (const [prodId, qty] of sortedProducts) {
      const prodDetails = await productModel.findById(prodId).lean();
      if (prodDetails) {
        topProducts.push({
          name: prodDetails.name,
          category: prodDetails.category?.toLowerCase() === "ropa" ? "Ropa" : "Calzado",
          price: prodDetails.price,
          salesCount: qty,
        });
      }
    }

    // 7. Chart 1: Ventas mensuales (last 6 months)
    const chartMonthlySalesLabels = [];
    const chartMonthlySalesData = [];
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      chartMonthlySalesLabels.push(monthNames[d.getMonth()]);

      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthOrders = allOrders.filter(
        (o) => o.ordered_at && new Date(o.ordered_at) >= startOfMonth && new Date(o.ordered_at) <= endOfMonth
      );
      const monthSalesSum = monthOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      chartMonthlySalesData.push(monthSalesSum);
    }

    // 8. Chart 2: Ingresos por categoría (Ropa vs Calzado)
    const productsMap = {};
    for (const p of activeProducts) {
      productsMap[p._id.toString()] = { category: p.category?.toLowerCase(), price: Number(p.price || 0) };
    }
    // Also query inactive products just in case they were sold in past orders
    const inactiveProducts = await productModel.find({ active: false }).lean();
    for (const p of inactiveProducts) {
      productsMap[p._id.toString()] = { category: p.category?.toLowerCase(), price: Number(p.price || 0) };
    }

    let ropaRevenue = 0;
    let calzadoRevenue = 0;

    for (const order of allOrders) {
      const items = cartMap[order.shopping_cart_id?.toString()] || [];
      for (const item of items) {
        if (item.product_id) {
          const prodInfo = productsMap[item.product_id.toString()];
          const cat = prodInfo?.category;
          const unitPrice = Number(item.unit_price || prodInfo?.price || 0);
          const quantity = Number(item.quantity || 1);
          const sub = Number(item.subtotal || (unitPrice * quantity));
          
          if (cat === "ropa") {
            ropaRevenue += sub;
          } else if (cat === "zapatos" || cat === "calzado") {
            calzadoRevenue += sub;
          }
        }
      }
    }

    // 9. Chart 3: Actividad semanal (unique customers placing orders per day of current week + base staff)
    const chartWeeklyUsersData = [0, 0, 0, 0, 0, 0, 0]; // Monday to Sunday
    const baseStaff = activeAdmins + activeEmployees;

    for (let i = 0; i < 7; i++) {
      chartWeeklyUsersData[i] = baseStaff;
    }

    const mapToWeekDay = (date) => {
      const d = date.getDay(); // 0 is Sunday, 1 is Monday...
      return d === 0 ? 6 : d - 1; // Map to Monday=0, ..., Sunday=6
    };

    const customersByDay = [new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set()];

    for (const order of thisWeekOrders) {
      if (order.ordered_at && order.shopping_cart_id) {
        const dayIdx = mapToWeekDay(new Date(order.ordered_at));
        if (dayIdx >= 0 && dayIdx < 7) {
          const customerId = cartCustomerMap[order.shopping_cart_id.toString()];
          if (customerId) {
            customersByDay[dayIdx].add(customerId);
          }
        }
      }
    }

    for (let i = 0; i < 7; i++) {
      chartWeeklyUsersData[i] += customersByDay[i].size;
    }

    // 10. Chart 4: Estadísticas de pedidos (Pendiente, En producción, Finalizado)
    const pendingCount = allOrders.filter((o) => o.order_status === false && o.payment_status === false).length;
    const inProductionCount = allOrders.filter((o) => o.order_status === false && o.payment_status === true).length;
    const finalizedCount = allOrders.filter((o) => o.order_status === true).length;

    // Build the final response payload
    res.status(200).json({
      cards: [
        {
          id: 1,
          title: "Ventas de la semana",
          value: `$${thisWeekSales.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
          change: salesCardChange.change,
          trend: salesCardChange.trend,
          icon: "fa-bag-shopping",
          iconBg: "bg-indigo-50",
          iconColor: "text-indigo-600",
        },
        {
          id: 2,
          title: "Ingresos de la semana",
          value: `$${thisWeekIncome.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
          change: incomeCardChange.change,
          trend: incomeCardChange.trend,
          icon: "fa-dollar-sign",
          iconBg: "bg-emerald-50",
          iconColor: "text-emerald-600",
        },
        {
          id: 3,
          title: "Inventario",
          value: totalInventoryStock.toLocaleString(),
          change: "Unidades disponibles en stock",
          trend: "neutral",
          icon: "fa-boxes-stacked",
          iconBg: "bg-amber-50",
          iconColor: "text-amber-600",
        },
        {
          id: 4,
          title: "Pedidos activos",
          value: activeOrdersCount.toString(),
          change: "Pedidos pendientes de entrega",
          trend: "neutral",
          icon: "fa-cart-shopping",
          iconBg: "bg-blue-50",
          iconColor: "text-blue-600",
        },
        {
          id: 5,
          title: "Usuarios activos",
          value: totalActiveUsers.toString(),
          change: "Usuarios con cuenta activa",
          trend: "neutral",
          icon: "fa-users",
          iconBg: "bg-violet-50",
          iconColor: "text-violet-600",
        },
      ],
      global: {
        totalRevenue: totalGlobalRevenue,
        totalOrders: totalOrdersCount,
      },
      topProducts,
      charts: {
        ventasMensuales: {
          labels: chartMonthlySalesLabels,
          data: chartMonthlySalesData,
        },
        ingresosCategoria: {
          labels: ["Ropa", "Calzado"],
          data: [ropaRevenue, calzadoRevenue],
        },
        usuariosSemanales: {
          labels: ["L", "M", "X", "J", "V", "S", "D"],
          data: chartWeeklyUsersData,
        },
        pedidosStatus: {
          labels: ["Pendientes", "En producción", "Finalizados"],
          data: [pendingCount, inProductionCount, finalizedCount],
        },
      },
    });
  } catch (error) {
    console.error("Error al calcular estadísticas de dashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
