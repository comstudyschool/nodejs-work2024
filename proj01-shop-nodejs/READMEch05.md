# 5장 Sequelize를 사용하여 관계형 데이터베이스와의 연관 관계 매핑을 구현
Express.js 환경에서는 ORM 라이브러리인 **Sequelize**를 사용하여 관계형 데이터베이스와의 연관 관계 매핑을 구현할 수 있습니다.

### **5.1 연관 관계 매핑**

Node.js에서는 **Sequelize**를 사용하여 구현할 수 있습니다. Sequelize는 다양한 연관 관계를 지원하며, 이를 통해 엔티티 간의 일대일, 일대다, 다대일, 다대다 관계를 설정할 수 있습니다.

### **1:1 연관 관계 설정 (일대일 매핑)**

Sequelize에서는 `hasOne`과 `belongsTo`로 구현합니다. 예를 들어, 회원과 장바구니 사이의 1:1 관계는 다음과 같이 설정할 수 있습니다.

```jsx
// 회원 모델 (Member)
module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
  });

  Member.associate = (models) => {
    Member.hasOne(models.Cart, {
      foreignKey: 'memberId',
      as: 'cart',
    });
  };

  return Member;
};

// 장바구니 모델 (Cart)
module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    items: DataTypes.JSON,
  });

  Cart.associate = (models) => {
    Cart.belongsTo(models.Member, {
      foreignKey: 'memberId',
      as: 'member',
    });
  };

  return Cart;
};

```

### **1:N 연관 관계 설정 (일대다 매핑)**

스프링 부트에서 `@OneToMany` 매핑을 Sequelize에서는 `hasMany`와 `belongsTo`로 구현합니다. 예를 들어, 한 명의 사용자는 여러 개의 주문을 할 수 있다고 가정할 때, 1:N 관계를 다음과 같이 설정할 수 있습니다.

```jsx
// 회원 모델 (Member)
module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
  });

  Member.associate = (models) => {
    Member.hasMany(models.Order, {
      foreignKey: 'memberId',
      as: 'orders',
    });
  };

  return Member;
};

// 주문 모델 (Order)
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    totalAmount: DataTypes.INTEGER,
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Member, {
      foreignKey: 'memberId',
      as: 'member',
    });
  };

  return Order;
};

```

### **N:M 연관 관계 설정 (다대다 매핑)**

스프링 부트의 `@ManyToMany` 매핑은 Sequelize에서 `belongsToMany`를 사용하여 설정합니다. 다대다 관계는 두 테이블 간의 연결 테이블을 통해 설정되며, 예를 들어, 주문과 상품 간의 다대다 관계를 다음과 같이 설정할 수 있습니다.

```jsx
// 상품 모델 (Item)
module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define('Item', {
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
  });

  Item.associate = (models) => {
    Item.belongsToMany(models.Order, {
      through: 'OrderItems',
      foreignKey: 'itemId',
      as: 'orders',
    });
  };

  return Item;
};

// 주문 모델 (Order)
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    totalAmount: DataTypes.INTEGER,
  });

  Order.associate = (models) => {
    Order.belongsToMany(models.Item, {
      through: 'OrderItems',
      foreignKey: 'orderId',
      as: 'items',
    });
  };

  return Order;
};

```

이렇게 설정하면 `OrderItems`라는 연결 테이블을 통해 주문과 상품 간의 다대다 관계가 설정됩니다.

### **5.2 즉시 로딩과 지연 로딩**

**`즉시 로딩(Eager Loading)인 반면`**, **`지연 로딩(Lazy Loading)`**을 사용하여 성능 최적화를 할 수 있습니다. Sequelize에서도 즉시 로딩과 지연 로딩을 지원하며, 다음과 같이 설정할 수 있습니다.

- **즉시 로딩**:
    
    ```jsx
    const orders = await Member.findAll({
      include: [{
        model: Order,
        as: 'orders',
        required: false
      }]
    });
    
    ```
    
- **지연 로딩**: 지연 로딩은 엔티티를 처음에 로드하지 않고, 필요할 때 `include` 옵션을 통해 관련 데이터를 로드하는 방식입니다.
    
    ```jsx
    const member = await Member.findByPk(memberId);
    const orders = await member.getOrders();
    
    ```
    

### **5.3 영속성 전이 (Cascade)**

equelize에서도 `onDelete`, `onUpdate` 옵션을 설정하여 연관된 엔티티의 상태를 전파할 수 있습니다.

```jsx
Member.hasMany(Order, {
  foreignKey: 'memberId',
  onDelete: 'CASCADE',  // 부모 엔티티가 삭제되면 자식 엔티티도 삭제
  onUpdate: 'CASCADE'
});

```