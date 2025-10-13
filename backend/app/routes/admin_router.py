# ---------------- GET ALL EMPLOYEES ----------------
@router.get("/employees", response_model=List[schemas.UserOut])
async def list_employees(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch all employees"""
    result = await db.execute(select(User).where(User.role == "employee"))
    employees = result.scalars().all()
    return employees

# ---------------- DELETE EMPLOYEE ----------------
@router.delete("/employees/{emp_id}")
async def delete_employee(
    emp_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == emp_id, User.role == "employee"))
    employee = result.scalars().first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    await db.delete(employee)
    await db.commit()
    return {"msg": "Employee deleted successfully"}

# ---------------- SUSPEND / UNSUSPEND EMPLOYEE ----------------
@router.patch("/employees/{emp_id}/suspend")
async def suspend_employee(
    emp_id: int,
    suspend: bool,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Suspend or unsuspend employee"""
    result = await db.execute(select(User).where(User.id == emp_id, User.role == "employee"))
    employee = result.scalars().first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Add a new column to User model called 'is_active' (Boolean, default=True)
    employee.is_active = not suspend
    db.add(employee)
    await db.commit()
    await db.refresh(employee)
    return {"msg": f"Employee {'suspended' if suspend else 'activated'} successfully"}

# ---------------- ADMIN-ONLY ROUTE ----------------
@router.post("/admin-only-route")
async def admin_action(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    return {"msg": f"Hello, admin {current_admin.username}"}
